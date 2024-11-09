const core = require("@actions/core");
const fse = require("fs-extra");
const path = require("path");

async function walk(parentPath, walkFn) {
  stats = await fse.lstat(parentPath);
  if (!stats.isDirectory()) {
    return await walkFn(parentPath);
  }

  const dir = await fse.opendir(parentPath);
  for await (const dirent of dir) {
    await walk(path.join(parentPath, dirent.name), walkFn);
  }
}

async function collectLocalFiles(root) {
  const absRoot = path.join(root);
  const files = new Set();
  await walk(absRoot, (path) => {
    let p = path.substring(absRoot.length);
    while (p[0] === "/") {
      p = p.substring(1);
    }
    files.add(p);
  });
  return files;
}

function readConfig(fields) {
  // 合并数组项
  const result = {};
  fields.forEach((k) => {
    if (typeof result[k] === "undefined") {
      result[k] = core.getInput(k);
    }
  });
  return result;
}

module.exports = {
  readConfig,
  collectLocalFiles,
};
