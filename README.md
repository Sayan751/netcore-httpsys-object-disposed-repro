# netcore-httpsys-object-disposed-repro

This repository is a reproduction of this issue: https://github.com/dotnet/aspnetcore/issues/42608.

The content of this repo is divided into 3 sections: hosting service, e2e tests, and SPA sources.

## SPA sources

Two SPAs can be found under the `SPA-sources` directory.
The apps are already built and the distributable can be found under the `hosting-service\Content` directory; a sub-directory for every app.
If you make any changes in the app, use `npm run build` to build the apps, which will put the new distributable correctly under the `hosting-service\Content` directory.

## Hosting service

The hosting service, located under the `hosting-service` directory, uses a self-signed certificate to use the domain name `gh.repro.sp.dev`.
This certificate is included in this repository as `gh.repro.sp.dev.pfx`.

Assuming Windows Environment:
- Make sure to add the certificate in the cert store (Local Computer/My).
- Add the `sslcert` by executing: `netsh http add sslcert hostnameport=gh.repro.sp.dev:7048 certhash=3bed9da4b7d762b3c00850865a05c647b4536fdd "appid={80AC362F-9C0D-4FB9-A284-03B2364BF60B}" certstorename=my`. You might need administrator privilege for that.
- Add the following to your `hosts` file: `127.0.0.1 gh.repro.sp.dev`.

## e2e tests

The e2e tests are located under the `e2e` directory.
The tests can be run using `npm test`.

## See the error in action

- Start the hosting service using `dotnet run` under the `hosting-service` directory.
- Start the tests using `npm test` under the `e2e` directory.

There should be intermittent errors:

```log
fail: Microsoft.AspNetCore.Server.HttpSys.HttpSysListener[6]
      ProcessRequestAsync
      System.ObjectDisposedException: Cannot access a disposed object.
      Object name: 'Microsoft.AspNetCore.Server.HttpSys.ResponseBody'.
         at Microsoft.AspNetCore.Server.HttpSys.ResponseBody.CheckDisposed()
         at Microsoft.AspNetCore.Server.HttpSys.ResponseBody.WriteAsync(Byte[] buffer, Int32 offset, Int32 count, CancellationToken cancellationToken)
         at System.IO.Stream.WriteAsync(ReadOnlyMemory`1 buffer, CancellationToken cancellationToken)
         at Microsoft.AspNetCore.Server.HttpSys.ResponseStream.WriteAsync(ReadOnlyMemory`1 buffer, CancellationToken cancellationToken)
         at System.IO.Pipelines.StreamPipeWriter.FlushAsyncInternal(Boolean writeToStream, ReadOnlyMemory`1 data, CancellationToken cancellationToken)
         at System.IO.Pipelines.StreamPipeWriter.CompleteAsync(Exception exception)
         at Microsoft.AspNetCore.Server.HttpSys.RequestContext.CompleteAsync()
         at Microsoft.AspNetCore.Server.HttpSys.RequestContext`1.ExecuteAsync()
         at Microsoft.AspNetCore.Server.HttpSys.RequestContext`1.ExecuteAsync()
```

## Important additional information

The error occurs when the log level is set to `Information`.
If the log level is changed to `Trace` (`appsettings.Development.json`), ...

```diff
 {
   "Logging": {
 	"LogLevel": {
- 		"Default": "Information",
- 		"System": "Information",
- 		"Microsoft": "Information",
- 		"Microsoft.AspNetCore": "Information",
+ 		"Default": "Trace",
+ 		"System": "Trace",
+ 		"Microsoft": "Trace",
+ 		"Microsoft.AspNetCore": "Trace"
 	}
   }
 }

```

...it seems that the `fail` log is changed into a `dbug` log.

```log
dbug: Microsoft.AspNetCore.StaticFiles.StaticFileMiddleware[14]
      The file transmission was cancelled
      System.Threading.Tasks.TaskCanceledException: A task was canceled.
         at Microsoft.AspNetCore.Server.HttpSys.ResponseStream.FlushAsync(CancellationToken cancellationToken)
         at Microsoft.AspNetCore.ResponseCaching.ResponseCachingStream.FlushAsync(CancellationToken cancellationToken)
         at Microsoft.AspNetCore.Http.StreamResponseBodyFeature.SendFileAsync(String path, Int64 offset, Nullable`1 count, CancellationToken cancellationToken)
         at Microsoft.AspNetCore.Http.SendFileResponseExtensions.SendFileAsyncCore(HttpResponse response, String fileName, Int64 offset, Nullable`1 count, CancellationToken cancellationToken)
         at Microsoft.AspNetCore.Http.SendFileResponseExtensions.SendFileAsyncCore(HttpResponse response, IFileInfo file, Int64 offset, Nullable`1 count, CancellationToken cancellationToken)
         at Microsoft.AspNetCore.StaticFiles.StaticFileContext.SendAsync()
```

Also note that the problem cannot be reproduced for `http` (as opposed to `https`) hosting.