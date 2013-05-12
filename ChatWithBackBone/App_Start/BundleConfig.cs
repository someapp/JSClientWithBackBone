using System.Web;
using System.Web.Optimization;

namespace ChatWithBackBone
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            
            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                "~/bundles/bootstrap-alert.js",
                "~/bundles/bootstrap-button.js",
                "~/bundles/bootstrap-carousel.js",
                "~/bundles/bootstrap-collapse.js",
                "~/bundles/bootstrap-dropdown.js",
                "~/bundles/bootstrap-modal.js",
                "~/bundles/bootstrap-popover.js",
                "~/bundles/bootstrap-scrollspy.js",
                "~/bundles/bootstrap-tab.js",
                "~/bundles/bootstrap-tooltip.js",
                "~/bundles/bootstrap-transition.js",  
                "~/bundles/bootstrap-typeahead.js"    
                ));

            bundles.Add(new ScriptBundle("~/bundles/jquery").Include(
                        "~/Scripts/jquery-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryui").Include(
                        "~/Scripts/jquery-ui-{version}.js"));

            bundles.Add(new ScriptBundle("~/bundles/jqueryval").Include(
                        "~/Scripts/jquery.unobtrusive*",
                        "~/Scripts/jquery.validate*"));

            // Use the development version of Modernizr to develop with and learn from. Then, when you're
            // ready for production, use the build tool at http://modernizr.com to pick only the tests you need.
            bundles.Add(new ScriptBundle("~/bundles/modernizr").Include(
                        "~/Scripts/modernizr-*"));
            bundles.Add(new ScriptBundle("~/bundles/imenhancement").Include(
                        "~/Scripts/strophe/strophe.*"));

            bundles.Add(new ScriptBundle("~/bundles/imenhancement").Include(
                        "~/Scripts/imenhancement/imclienttest.js",
                        "~/Scripts/imenhancement/imenhancement.js",
                        "~/Scripts/imenhancement/imenhancement_test.js",
                        "~/Scripts/imenhancement/idm-im.js", 
                        "~/Scripts/imenhancement/spark.api.client.js"));

            //bundles.Add(new StyleBundle("~/Content/css").Include("~/Content/site.css"));

            bundles.Add(new StyleBundle("~/Content/themes/base/css").Include(
                        "~/Content/themes/base/jquery.ui.core.css",
                        "~/Content/themes/base/jquery.ui.resizable.css",
                        "~/Content/themes/base/jquery.ui.selectable.css",
                        "~/Content/themes/base/jquery.ui.accordion.css",
                        "~/Content/themes/base/jquery.ui.autocomplete.css",
                        "~/Content/themes/base/jquery.ui.button.css",
                        "~/Content/themes/base/jquery.ui.dialog.css",
                        "~/Content/themes/base/jquery.ui.slider.css",
                        "~/Content/themes/base/jquery.ui.tabs.css",
                        "~/Content/themes/base/jquery.ui.datepicker.css",
                        "~/Content/themes/base/jquery.ui.progressbar.css",
                        "~/Content/themes/base/jquery.ui.theme.css"));

            bundles.Add(new StyleBundle("~/Content/bootstrapcss").Include(
                "~/Content/bootstrap-responsive.min.css",
                "~/Content/bootstrap.min.css"));
            bundles.Add(new StyleBundle("~/Content/qunit").Include(
                "~/Content/qunit-1.11.0.css"));

            bundles.Add(new ScriptBundle("~/bundles/bootstrap").Include(
                "~/Scripts"
                ));

        }
    }
}