var ManageFolders = (function()
{
  var folderNodeId;

  var MF = {
    init : function MF_init() {
      var contextMenu = document.getElementById("placesContext");
      if (contextMenu)
        contextMenu.addEventListener("popupshowing",
                                     MF.showHideMenuItem, false);
    },

    showHideMenuItem : function MF_showHideMenuItem(event) {
      var node = event.target._view.selectedNode

      if (node) {
        var isFolder = PlacesUtils.nodeIsFolder(node);
        if (isFolder) folderNodeId = node.itemId;
        // show or disable the 'manage folder' menu item every time the menu is rendered
        document.getElementById("placesContext_manageFolder").hidden = !isFolder;
      }
    },

    showOrganizer : function MF_showOrganizer(event) {
      // check to see if organizer already open or open it. Needs to stay consistent
      // with the actual window opening calls found in browser-places.js
      // http://mxr.mozilla.org/firefox/source/browser/base/content/browser-places.js#544
      var wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);
      var organizer = wm.getMostRecentWindow("Places:Organizer");

      function selectFolder() {
        // The tree object, aka organizer.PlacesOrganizer._places (vai places.js)
        var places = organizer.document.getElementById("placesList");
        if (places) {
          places.selectItems([folderNodeId]);
          if (places.currentIndex)
            places.treeBoxObject.ensureRowIsVisible(places.currentIndex);
          places.focus();
        }
      }

      if (!organizer) {
        // once organizer window is loaded, postpone folder selection until after
        // the organizer init method is executed (see places.js)
        function selectOnLoad() {
          setTimeout(selectFolder, 1);
          organizer.removeEventListener("load", selectOnLoad, false);
        }

        organizer = openDialog("chrome://browser/content/places/places.xul",
                               "", "chrome,toolbar=yes,dialog=no,resizable");
        organizer.addEventListener("load", selectOnLoad, false);
      }
      else {
        selectFolder()
      }

      organizer.window.focus()
    }
  }
  return MF
})()

window.addEventListener("load", ManageFolders.init, false);
