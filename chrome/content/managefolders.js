var ManageFolders = (function()
{
  var folderNodeUri;

  var MF = {
    init : function MF_init() {
      var contextMenu = document.getElementById("placesContext");

      if (contextMenu) {
        contextMenu.addEventListener("popupshowing", MF.showHideMenuItem, false);
      }
    },

    showHideMenuItem : function MF_showHideMenuItem(event) {
      var node = event.target._view.selectedNode;

      if (node) {
        var isFolder = PlacesUtils.nodeIsFolder(node);

        if (isFolder) {
          folderNodeUri = node.uri;
        }

        // show or disable the 'manage folder' menu item every time the menu is rendered
        var el = document.getElementById("placesContext_manageFolder");
        el.hidden = el.disabled = !isFolder;
      }
    },

    showOrganizer : function MF_showOrganizer(event) {

      function selectFolder() {
        // The tree object, aka organizer.PlacesOrganizer._places (via places.js)
        var places = organizer.document.getElementById("placesList");

        if (places) {
          // Feels fragile... but as of FF34, selectItems(...) no longer searches within Toolbar
          places.selectPlaceURI(folderNodeUri + '&excludeItems=1&expandQueries=0');

          if (places.currentIndex) {
            places.treeBoxObject.ensureRowIsVisible(places.currentIndex);
          }

          places.focus();
        }
      }

      function selectOnLoad() {
        // postpone folder selection until the organizer init method has executed (see places.js)
        setTimeout(function () { selectFolder(); }, 1);
        organizer.removeEventListener("load", selectOnLoad, false);
      }

      // check to see if organizer already open or open it. Needs to stay consistent
      // with the actual window opening calls found in browser-places.js
      // http://mxr.mozilla.org/firefox/source/browser/base/content/browser-places.js#544
      var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
      var organizer = wm.getMostRecentWindow("Places:Organizer");

      if (!organizer) {
        organizer = openDialog("chrome://browser/content/places/places.xul",
                               "", "chrome,toolbar=yes,dialog=no,resizable");
        organizer.addEventListener("load", selectOnLoad, false);
      }
      else {
        selectFolder();
      }

      organizer.window.focus();
    }
  };

  return MF;

})();

window.addEventListener("load", ManageFolders.init, false);
