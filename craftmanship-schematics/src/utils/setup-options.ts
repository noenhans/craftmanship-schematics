import { buildDefaultPath, getProject } from '@schematics/angular/utility/project';
import { getWorkspace } from '@schematics/angular/utility/config';
import { parseName } from '@schematics/angular/utility/parse-name';
import { Tree, SchematicsException } from "@angular-devkit/schematics";
import { normalize, strings } from '@angular-devkit/core';
import { findModuleFromOptions } from '@schematics/angular/utility/find-module';

export function setupOptions(tree: Tree, options: any): Tree {
  const workspace = getWorkspace(tree);

  if (!options.project) {
    options.project = Object.keys(workspace.projects)[0];
  }
  if (!options.project) {
    throw new SchematicsException('Option "project" is required.');
  }

  const project = getProject(workspace, options.project);
  if (options.path === undefined) {
    options.path = normalize(buildDefaultPath(project));
  }
  
  const parsedPath = parseName(options.path, options.name);
  options.name = parsedPath.name;
  options.path = parsedPath.path;

  options.module = options.module || findModuleFromOptions(tree, options) || '';

  options.selector = options.selector || buildSelector(options, project && project.prefix || '');

  return tree;
}

function buildSelector(options:any, projectPrefix:string) {
  let selector = strings.dasherize(options.name);

  if (options.prefix) {
      selector = `${options.prefix}-${selector}`;
  } else if (projectPrefix) {
      selector = `${projectPrefix}-${selector}`;
  }

  return selector;
}