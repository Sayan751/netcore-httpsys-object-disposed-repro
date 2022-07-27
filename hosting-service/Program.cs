using System.Diagnostics;
using System.Net;
using System.Runtime.Versioning;
using System.Text.Json;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.Extensions.FileProviders;
using HostingService;
using Microsoft.AspNetCore.Server.HttpSys;

[assembly: SupportedOSPlatform("windows")]

var config = new ConfigurationBuilder()
	.AddCommandLine(args)
	.Build();

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
	Args = args,
	WebRootPath = config.GetValue("Webroot", "./Content"),
});

var services = builder.Services;
services
	.AddLogging(b => b.AddConsole())
	.Configure<HttpSysOptions>(options =>
	{
		options.UrlPrefixes.Add(UrlPrefix.Create(
			"https",
			"gh.repro.sp.dev",
			"7048",
			"/"));
	});
var env = builder.Environment;

builder.WebHost
	.UseConfiguration(config)
	.UseHttpSys();

var app = builder.Build();

app
	.UseHsts()
	.Use((context, next) =>
	{
		var host = config.GetValue<string>("HostingPrefix");
		context.Response.Headers.Add(
			"Content-Security-Policy",
			$"default-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self'; font-src 'self' data:; connect-src 'self'{(!string.IsNullOrEmpty(host) ? $" {host}:*" : string.Empty)}"
		);

		// For security reasons we disable everything but the GET verb...
		if (string.Equals(context.Request.Method, HttpMethod.Get.Method, StringComparison.OrdinalIgnoreCase))
			return next();

		context.Response.StatusCode = (int)HttpStatusCode.MethodNotAllowed;
		return Task.CompletedTask;
	})
	.UseResponseCaching()
	.UseStaticFiles(new StaticFileOptions
	{
		OnPrepareResponse = context =>
		{
			if (context.Context.Response.HasStarted ||
				context.Context.Response.StatusCode != (int)HttpStatusCode.OK) return;
			context.Context.Response.Headers["Cache-Control"] = "public, max-age=1000";
			context.Context.Response.Headers["Vary"] = "Accept-Encoding";
		},
	});

var layoutFile = Path.Combine(env.WebRootPath, "apps.json");
if (File.Exists(layoutFile))
{
	var rootApps = new HashSet<string>();
	var layout = JsonSerializer.Deserialize<ApplicationLayout>(File.ReadAllText(layoutFile));
	foreach (var category in layout.categories)
		foreach (var application in category.apps)
		{

			var parts = application.path.Split(new[] { '/' }, StringSplitOptions.RemoveEmptyEntries);
			if (rootApps.Contains(parts[0])) continue;
			rootApps.Add(parts[0]);
			var physicalPath = parts[0];
			app.MapWhen(
				context => IsSpaMatch(context.Request.Path, physicalPath),
				c => c.UseSpa(spa =>
				{
					var sourcePath = Path.Combine(env.WebRootPath, physicalPath);
					spa.Options.SourcePath = sourcePath;
					spa.Options.DefaultPageStaticFileOptions = new StaticFileOptions
					{
						FileProvider = new PhysicalFileProvider(sourcePath)
					};
				})
			);
		}

	app.UseRewriter(new RewriteOptions().AddRedirect("^$", rootApps.First()));
}

if (env.IsDevelopment())
{
	app.UseDeveloperExceptionPage();
}

app.Run();


static bool IsSpaMatch(PathString requestedPath, string appName)
{
	if (!requestedPath.HasValue) return false;

	var path = requestedPath.Value.AsSpan();
	if (path.Length == 0) return false;
	if (path[0] == '/') path = path[1..];

	if (path.StartsWith(appName, StringComparison.OrdinalIgnoreCase)) return true;

	var index = path.IndexOf("/", StringComparison.Ordinal);
	if (index == -1) return false;
	return path[(index + 1)..].StartsWith(appName, StringComparison.OrdinalIgnoreCase);
}