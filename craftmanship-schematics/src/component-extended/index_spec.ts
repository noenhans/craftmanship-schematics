import {
  SchematicTestRunner,
  UnitTestTree
} from '@angular-devkit/schematics/testing';
import * as path from 'path';
import { Schema as ComponentSchema } from '@schematics/angular/component/schema';
import { Schema as WorkspaceSchema } from '@schematics/angular/workspace/schema';
import { Schema as ApplicationSchema } from '@schematics/angular/application/schema';

describe('component-extended', () => {
  const collectionPath = path.join(__dirname, '../collection.json');
  let runner: SchematicTestRunner;
  let tree: UnitTestTree;

  const workspaceOptions: WorkspaceSchema = {
    name: 'project',
    version: '6.0.0'
  };

  const appOptions: ApplicationSchema = {
    name: 'component-expanded-test'
  };

  beforeEach(async () => {
    runner = new SchematicTestRunner('schematics', collectionPath);
    tree = await createTestApp(runner, workspaceOptions, appOptions);
  });

  it('works', async () => {
    const baseOptions: ComponentSchema = {
      name: 'foo',
      project: 'component-expanded-test'
    };

    runner
    .runSchematicAsync('component-extended', baseOptions, tree)
    .subscribe(tree => {
        expect(tree.files).toContain('/component-expanded-test/src/app/foo/foo.component.html');
        expect(tree.files).toContain('/component-expanded-test/src/app/foo/foo.component.ts');
        expect(tree.files).toContain('/component-expanded-test/src/app/foo/foo.component.css');
        expect(tree.files).toContain('/component-expanded-test/src/app/foo/foo.component.spec.ts');


        const module = tree.read('/component-expanded-test/src/app/app.module.ts');

        if (module) {
          const moduleContent = module.toString();

          expect(moduleContent).toMatch(/import.*Foo.*from '.\/foo\/foo.component'/);
          expect(moduleContent).toMatch(/declarations:\s*\[[^\]]+?,\r?\n\s+FooComponent\r?\n/m);
        } else {
          fail('upsss... coś nie pykło przy updatowaniu modulu.');
        }

        const component = tree.read('/component-expanded-test/src/app/foo/foo.component.ts');

        if (component) {
          const componentContent = component.toString();

          expect(componentContent).toMatch('import { Component, OnInit, OnChanges, OnDestroy, SimpleChanges } from \'@angular/core\';');
          expect(componentContent).toMatch('import { Subject } from \'rxjs\';');
          expect(componentContent).toMatch('export class FooComponent implements OnInit, OnChanges, OnDestroy {');
          expect(componentContent).toMatch('private unsubscribe');
          expect(componentContent).toMatch('ngOnChanges');
          expect(componentContent).toMatch('ngOnDestroy');
        } else {
          fail('upsss... coś nie pykło przy generowaniu komponentu');
        }
      });
  });

});

async function createTestApp(runner: SchematicTestRunner, workspaceOptions: WorkspaceSchema, appOptions: ApplicationSchema): Promise<UnitTestTree> {
  const workspaceTree = runner.runExternalSchematic('@schematics/angular', 'workspace', workspaceOptions);

  return runner.runExternalSchematicAsync('@schematics/angular', 'application', appOptions, workspaceTree)
    .toPromise()
}
