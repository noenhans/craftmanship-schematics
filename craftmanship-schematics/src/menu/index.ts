import { Rule, Tree, filter, SchematicsException, apply, url, applyTemplates, move, mergeWith, chain, branchAndMerge } from '@angular-devkit/schematics';
import { Schema as MenuOptions } from './schema';
import { setupOptions } from '../utils/setup-options';
import { normalize } from 'path';
import { strings } from '@angular-devkit/core';
import { addDeclarationToNgModule } from '../utils/ng-module-utils';

export function menu(options: MenuOptions): Rule {
  return (tree: Tree) => {
    setupOptions(tree, options);

    if (!options.path) {
      throw new SchematicsException('Option "path" is undefined.');
    }

    const movePath = normalize(options.path + '/' + strings.dasherize(options.name));

    const templateSource = apply(url('./files'), [
      filterTemplate(options),
      applyTemplates({
        ...strings,
        ...options,
      }),
      move(movePath),
    ]);

    return chain([
      branchAndMerge(chain([
        mergeWith(templateSource),
        addDeclarationToNgModule(options)
      ]))
    ]);
  };
}

function filterTemplate(options: MenuOptions): Rule {
  if (!options.menuService) {
    return filter(path => !path.match(/\.service\.ts/) && !!path.match(/\.template$/))
  }
  return filter(path => !!path.match(/\.template$/));
}
