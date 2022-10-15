<#
.Synopsis
   Sets the assembly version of all assemblies in the source directory.
.DESCRIPTION
   A build script that can be included in TFS 2015 or Visual Studio Online (VSO) vNevt builds that update the version of all assemblies in a workspace.
   It uses the name of the build to extract the version number and updates all AssemblyInfo.cs files to use the new version.
.EXAMPLE
   Set-ServiceManifestVersion -BasePath ".\SourceDir" -BuildSourceVersion 1234
#>
[CmdletBinding()]
[Alias()]
[OutputType([int])]
Param(
    # The path to the source directory. Default $Env:BUILD_REPOSITORY_LOCALPATH is set by TFS.
    [Parameter(Mandatory=$true, Position=0)]
    [ValidateNotNullOrEmpty()]
    [string]$BasePath,

    # The source version. Default $Env:BUILD_SOURCEVERSION is set by TFS.
    [Parameter(Mandatory=$true, Position=1)]
    [ValidateNotNullOrEmpty()]
    [string]$BuildSourceVersion
)

<#
.Synopsis
   Sets the assembly version of all assemblies in the source directory.
.DESCRIPTION
   A build script that can be included in TFS 2015 or Visual Studio Online (VSO) vNevt builds that update the version of all assemblies in a workspace.
   It uses the name of the build to extract the version number and updates all AssemblyInfo.cs files to use the new version.
.EXAMPLE
   Set-ServiceManifestVersion -BasePath ".\SourceDir" -BuildSourceVersion 1234
#>
function Set-ServiceManifestCodeVersion
{
    [CmdletBinding()]
    [Alias()]
    [OutputType([int])]
    Param
    (
        # The path to the source directory. Default $Env:BUILD_REPOSITORY_LOCALPATH is set by TFS.
        [Parameter(Mandatory=$false, Position=0)]
        [ValidateNotNullOrEmpty()]
        [string]$BasePath = $Env:BUILD_REPOSITORY_LOCALPATH,

        # The build number. Default $Env:BUILD_SOURCEVERSION is set by TFS.
        [Parameter(Mandatory=$false, Position=1)]
        [ValidateNotNullOrEmpty()]
        [string]$BuildSourceVersion = $Env:BUILD_SOURCEVERSION
    )

    if (-not (Test-Path $BasePath)) {
        throw "The directory '$BasePath' does not exist."
    }

	$applicationManifestFile = Get-ApplicationManifest -BasePath $BasePath
    $serviceManifestFiles = Get-ServiceManifestFiles -BasePath $BasePath

    Set-ServiceManifestVersion -Files $serviceManifestFiles -VersionSuffix $BuildSourceVersion    
	Set-ApplicationManifestVersion -File $applicationManifestFile -VersionSuffix $BuildSourceVersion
}

function Get-ServiceManifestFiles
{
    [CmdletBinding()]
    [Alias()]
    [OutputType([System.IO.FileSystemInfo[]])]
    Param
    (
        [Parameter(Mandatory=$true, Position=0)]
        [ValidateNotNullOrEmpty()]
        [string]$BasePath
    )
	return Get-ChildItem -File -Recurse $BasePath -filter "ServiceManifest.xml"    
}


function Get-ApplicationManifest
{
    [CmdletBinding()]
    [Alias()]
    [OutputType([System.IO.FileSystemInfo[]])]
    Param
    (
        [Parameter(Mandatory=$true, Position=0)]
        [ValidateNotNullOrEmpty()]
        [string]$BasePath
    )
	return Get-ChildItem -File -Recurse $BasePath -filter "ApplicationManifest.xml" | Select-Object -First 1
}

function Set-ServiceManifestVersion
{
    [CmdletBinding()]
    [OutputType([int])]
    Param
    (
        [Parameter(Mandatory=$true, Position=0)]
        [System.IO.FileSystemInfo[]]$Files,

        [Parameter(Mandatory=$true, Position=1)]
        [string]$VersionSuffix
    )
	
	#service manifest update
    foreach ($file in $Files)
    {
        [xml]$xml = Get-Content $file.FullName
		
		$newVersion = ($xml.ServiceManifest.CodePackage.Version -replace "^(.+\.)\d+$", '$1') + $VersionSuffix

		Write-Information -Message ("Setting ServiceManifest.Version to " + $newVersion)
		Write-Information -Message ("Setting ServiceManifest.CodePackage.Version to " + $newVersion)

        $xml.ServiceManifest.CodePackage.Version = $newVersion
		$xml.ServiceManifest.Version = $newVersion
			
		attrib $file.FullName -r

		$xml.Save($file.FullName)        
    }
}

function Set-ApplicationManifestVersion{
	[CmdletBinding()]
    [OutputType([int])]
    Param
    (
		[Parameter(Mandatory=$true, Position=1)]
		 [System.IO.FileSystemInfo]$File,

        [Parameter(Mandatory=$true, Position=2)]
        [string]$VersionSuffix
    )
	
	[xml]$xml = Get-Content $File.FullName
	
	$newVersion = ($xml.ApplicationManifest.ApplicationTypeVersion -replace "^(.+\.)\d+$", '$1') + $VersionSuffix

	$xml.ApplicationManifest.ApplicationTypeVersion = $newVersion
	($xml.ApplicationManifest.ServiceManifestImport)
	$xml.ApplicationManifest.ServiceManifestImport.ServiceManifestRef | foreach { $_.ServiceManifestVersion = $newVersion }
		
	Write-Information -Message ("Setting ApplicationManifest.ApplicationTypeVersion to " + $newVersion)
	Write-Information -Message ("Setting ApplicationManifest.ServiceManifestImport.ServiceManifestRef.ServiceManifestVersion to " + $newVersion)
		
	attrib $File.FullName -r

	$xml.Save($File.FullName)       
}


if (-not ($myinvocation.line.Contains("`$here\`$sut"))) {
	Set-ServiceManifestCodeVersion -BasePath $BasePath -BuildSourceVersion $BuildSourceVersion
}
