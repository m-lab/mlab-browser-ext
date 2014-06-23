/* vim: set expandtab ts=2 sw=2: */
self.port.on("NDT.testPreferences", function (testPreferences) {
  for (i in testPreferences) {
    addon.port.emit("getTestPreference", { test: "NDT",
      key: testPreferences[i].key,
      type: testPreferences[i].type,
      description: testPreferences[i].description,
      defaultValue: testPreferences[i].defaultValue
      });
  }
});

self.port.on("NDT.testPreference", function (testPreference) {
  renderPreference(document.getElementById("NDT_PreferencesArea"), testPreference);
});
