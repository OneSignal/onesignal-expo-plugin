export const addTargetDependency = function(xcodeProject: any, target: string, dependencyTargets: string[]) {
  console.log("adding target dependency");
  console.log("dependencyTargets:", dependencyTargets);
  if (!target) {
    console.log("Target undefined");
    return undefined;
  }

  var nativeTargets = xcodeProject.pbxNativeTargetSection();
  console.log(">>>Native targets:", JSON.stringify(nativeTargets));

  if (typeof nativeTargets[target] == "undefined") {
      console.log("Error 1");
      throw new Error("Invalid target: " + target);
  }

  for (var index = 0; index < dependencyTargets.length; index++) {
      var dependencyTarget = dependencyTargets[index];
      console.log("Error 2:", dependencyTarget, dependencyTarget.length);
      if (typeof nativeTargets[dependencyTarget] == "undefined")
        throw new Error("Invalid target: " + dependencyTarget);
      }

  var pbxTargetDependency = 'PBXTargetDependency',
      pbxContainerItemProxy = 'PBXContainerItemProxy',
      pbxTargetDependencySection = xcodeProject.hash.project.objects[pbxTargetDependency],
      pbxContainerItemProxySection = xcodeProject.hash.project.objects[pbxContainerItemProxy];

  for (var index = 0; index < dependencyTargets.length; index++) {
      var dependencyTargetUuid = dependencyTargets[index],
          targetDependencyUuid = xcodeProject.generateUuid(),
          itemProxyUuid = xcodeProject.generateUuid(),
          itemProxy = {
              isa: pbxContainerItemProxy,
              containerPortal: xcodeProject.hash.project['rootObject'],
              containerPortal_comment: xcodeProject.hash.project['rootObject_comment'],
              proxyType: 1,
              remoteGlobalIDString: dependencyTargetUuid,
              remoteInfo: nativeTargets[dependencyTargetUuid].name
          },
          targetDependency = {
              isa: pbxTargetDependency,
              target: dependencyTargetUuid,
              targetProxy: itemProxyUuid,
              targetProxy_comment: pbxContainerItemProxy
          };
      console.log("here1");
      if (pbxContainerItemProxySection && pbxTargetDependencySection) {
        console.log("here2");
          pbxContainerItemProxySection[itemProxyUuid] = itemProxy;
          pbxTargetDependencySection[targetDependencyUuid] = targetDependency;
          nativeTargets[target].dependencies.push({ value: targetDependencyUuid, comment: pbxTargetDependency })
      }
  }

  return { uuid: target, target: nativeTargets[target] };
}