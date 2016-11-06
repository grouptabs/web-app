define(function () {
  'use strict';

  // immutable array helpers
  var iarray = {
    add: function (array, item) {
      return array.concat(item);
    },

    addUniq: function (array, item) {
      var index = array.indexOf(item);
      if (index !== -1) {
        return array;
      }

      return iarray.add(array, item);
    },

    remove: function (array, index) {
      array = array.slice();  // copy
      array.splice(index, 1);
      return array;
    },

    removeItem: function (array, item) {
      var index = array.indexOf(item);

      if (index !== -1) {
        return iarray.remove(array, index);
      }

      return array;
    }
  };

  // immutable object helpers
  var iobject = {
    set: function (object, key, data) {
      object = Object.assign({}, object);  // copy
      object[key] = data;
      return object;
    },

    remove: function (object, key) {
      object = Object.assign({}, object);  // copy
      delete object[key];
      return object;
    }
  };

  function docsReducer (state, actionMap) {
    var docsById = state.docsById;
    var tabs = state.tabs;
    var transactionsByTab = state.transactionsByTab;

    actionMap.delete.forEach(function (dbDoc) {
      var doc = docsById[dbDoc.id];

      if (!doc) {
        return;
      }

      docsById = iobject.remove(docsById, doc.id);

      var tabId = dbDoc.tabId;
      if (doc.type === 'transaction') {
        var transactions = transactionsByTab[tabId];
        transactionsByTab = iobject.set(transactionsByTab, tabId, iarray.removeItem(transactions, doc.id));
      }
    });

    actionMap.createOrUpdate.forEach(function (doc) {
      var tabId = doc.tabId;

      if (doc.type === 'info') {
        doc = Object.assign({}, doc, {
          id: 'info-' + tabId
        });

        tabs = iarray.addUniq(tabs, tabId);
      }

      docsById = iobject.set(docsById, doc.id, doc);

      if (doc.type === 'transaction') {
        transactionsByTab = iobject.set(transactionsByTab, tabId, iarray.addUniq(transactionsByTab[tabId] || [], doc.id));
      }
    });

    return Object.assign({}, state, {
      docsById: docsById,
      tabs: tabs,
      transactionsByTab: transactionsByTab
    });
  }

  var initialState = {
    loading: false,
    currentTab: null,
    docsById: {},
    tabs: [],
    transactionsByTab: {}
  };

  return function (state, action) {
    if (!state) {
      return initialState;
    }

    switch (action.type) {
      case 'UPDATE_FROM_DB':
        return Object.assign({}, docsReducer(state, action.actionMap));

      case 'CREATE_TAB':
        return Object.assign({},
          docsReducer(state, {
            createOrUpdate: [action.doc],
            delete: []
          }),
          {
            currentTab: action.doc.tabId
          }
        );

      case 'NAVIGATE_TO_TABS':
        return Object.assign({}, state, {
          currentTab: null
        });

      case 'SELECT_TAB':
        return Object.assign({}, state, {
          currentTab: action.id
        });

      case 'PUT_DOC':
        return Object.assign({}, docsReducer(state, {
          createOrUpdate: [action.doc],
          delete: []
        }));

      case 'DELETE_DOC':
        return Object.assign({}, docsReducer(state, {
          createOrUpdate: [],
          delete: [action.doc]
        }));

      default:
        return state;
    }
  };

});