using ContentProxySvc;
using DistributorService;
using HLF.Lib.Connected.Rest;
using Loyalty.Customer.Models.Configuration;
using Loyalty.Customer.Provider;
using Loyalty.Customer.Provider.Helpers;
using Loyalty.Customer.Provider.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Shop.Storefront.Account.Authentication;
using Shop.Storefront.Common.Infrastructure.Hosting;
using Shop.Storefront.Common.Infrastructure.Logging;
using Shop.Storefront.Common.Infrastructure.StorefrontData;
using Shop.Storefront.Common.Localization;
using Shop.Storefront.Content.Infrastructure.TagHelpers;
using System.ServiceModel;

namespace Loyalty.Customer.WebCore
{
    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
            JsonServiceProxyOptions.SetHttpOutboundConnectionLimit(8192);
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // Options settings
            services.Configure<GeneralSettings>(Configuration.GetSection("GeneralSettings"));
            services.Configure<EndPoints>(Configuration.GetSection("Endpoints"));

            // Add framework services.
            services.AddSession()
                .AddMvc()
                .AddViewLocalization();

            // Localization
            services.AddLocalization(options => options.ResourcesPath = "LocalResources");

            // Login connectionstring
            services.AddDataProtection()
                .PersistKeysToAzureBlobStorage(CloudStorageAccount.Parse(Configuration["ConnectionStrings:DataProtectionBlobConnection"]), "keystore/storefrontkeys.xml")
                .SetApplicationName("Shop.Storefront");

            // Store options
            services.AddOptions();
            var storefrontDataOptions = new StorefrontDataOptions();
            Configuration.GetSection(nameof(StorefrontDataOptions)).Bind(storefrontDataOptions);
            services.AddStorefrontData(storefrontDataOptions);

            // Adapters
            var serviceProvider = services.BuildServiceProvider();
            var contentAdapter = new ContentAdapter(serviceProvider.GetService<IMemoryCache>(), Configuration["Endpoints:ContentUrl"]);
            var contentProxy = new ContentProxyServiceClient(ContentProxyServiceClient
                .EndpointConfiguration.BasicHttpBinding_IContentProxyService,
                new EndpointAddress(Configuration["Endpoints:IAContentProxyUrl"]));

            var uri = Configuration["Endpoints:DistributorService"];

            var distributorProxy = new DistributorServiceClient(DistributorServiceClient.EndpointConfiguration.BasicHttpBinding_IDistributorService, new EndpointAddress(uri));

            services.AddSingleton(contentAdapter);
            services.AddSingleton(contentProxy);
            services.AddSingleton<ProxyHelper>();
            services.AddSingleton<CustomerHelper>();
            services.AddSingleton<IProgramProvider, ProgramProvider>();
            services.AddSingleton<IDistributorProvider, DistributorProvider>();
            services.AddSingleton(distributorProxy);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            //loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            //loggerFactory.AddProvider(new EventSourceLoggerProvider((_, logLevel) => logLevel >= Microsoft.Extensions.Logging.LogLevel.Trace));
            loggerFactory.ConfigureLogging(Configuration, ServiceEventSource.Current.Message);
            app.UseRequestLocalization(LocalizationConfig.Configure());

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }
            // Storefront data
            app.UseStorefrontData();

            // Auth config
            app.UseCookieAuthentication(CustomerAuthentication.DefaultOptions);

            // MVC configuration
            app.UseStaticFiles();
            app.UseHealthcheck();
            app.UseSession();
            app.UseMvc(routes =>
            {
                //App controllers
                routes.MapRoute(
                    name: "loyalty",
                    template: "loyalty/{controller=Home}/{action=Index}/{locale=regex(^[a-z]{{2}}-[A-Z]{{2}}$)}/{id?}");

                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{locale=regex(^[a-z]{{2}}-[A-Z]{{2}}$)}/{id?}");
            });
        }
    }
}
