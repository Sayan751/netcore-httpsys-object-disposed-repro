namespace HostingService;

public class App
{
	public string path { get; set; }
}

public class Category
{
	public IList<App> apps { get; set; }
}

public class ApplicationLayout
{
	public IList<Category> categories { get; set; }
}