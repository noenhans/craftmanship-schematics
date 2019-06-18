import { Rule, SchematicContext, Tree, chain, externalSchematic, SchematicsException, apply,
  url, applyTemplates, move, mergeWith, MergeStrategy
} from '@angular-devkit/schematics';
import { normalize, strings } from '@angular-devkit/core';
import { setupOptions } from '../utils/setup-options';
import { Schema } from '@schematics/angular/component/schema';

export function componentExtended(options: Schema): Rule {
  return chain([
    externalSchematic('@schematics/angular', 'component', options),
    (tree: Tree, context: SchematicContext) => {
      setupOptions(tree, options);

      if (!options.path) {
        throw new SchematicsException('Option "path" is undefined.');
      }

      const movePath = (options.flat)
        ? normalize(options.path)
        : normalize(options.path + '/' + strings.dasherize(options.name));

      const templateSource = apply(url('./files'), [
        applyTemplates({
          ...strings,
          ...options,
        }),
        move(movePath)
      ]);

      context.logger.info('TS-file has been overwritten.')

      return mergeWith(templateSource, MergeStrategy.Overwrite)
    }
  ]);
}
