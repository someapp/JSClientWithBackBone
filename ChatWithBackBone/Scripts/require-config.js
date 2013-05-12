require.config({
    paths: {
        "jquery": "~/Scripts/jquery-1.7.1"
    }
});


// Now that we have configured a named alias for the jQuery
// library, let's try to load it using the named module.
require(
                [
                    "jquery"
                ],
                function ($17) {
                    // Log the callback parameter.
                    console.log("$17.fn.jquery:", $17.fn.jquery);
                }
            );