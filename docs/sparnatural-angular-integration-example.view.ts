import { MetaModel, SparqlEndpoint } from '@/common';
import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  inject,
  isDevMode,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';
import { TranslocoService } from '@ngneat/transloco';
import { delay, switchMap } from 'rxjs';

import { RegistryService } from '../../core';
import { EndpointSelectorComponent } from '../../ui/endpoint-selector/endpoint-selector.component';
import { PageContentComponent } from '../../ui/page-content/page-content.component';
import { YasguiComponent } from '../../ui/yasgui/yasgui.component';

const global_ttl = `...`

@Component({
  selector: 'client-vdse-sparnatural',
  standalone: true,
  imports: [CommonModule, PageContentComponent, YasguiComponent, EndpointSelectorComponent, MatSelect, MatOption, MatFormField, MatLabel],
  template: `
    <client-vdse-page-content>
      <div class="my-selectors">
        <client-vdse-endpoint-selector [value]="endpoint" (selected)="onEndpointChange($event)"></client-vdse-endpoint-selector>
        <mat-form-field appearance="fill">
          <mat-label>Model</mat-label>
          <mat-select [value]="model" (valueChange)="model = $event">
            <mat-option *ngFor="let option of modelOptions" [value]="option">{{ option.name }}</mat-option>
          </mat-select>
        </mat-form-field>
      </div>
      <spar-natural
        #sparnatural
        [attr.src]="ttl"
        [attr.endpoint]="endpoint?.url ?? ''"
        [attr.lang]="lang"
        [attr.defaultLang]="lang"
        [attr.debug]="debug"
        submitButton="false"
        limit="1000"
      />
      <client-vdse-yasgui *ngIf="endpoint" [endpoint]="endpoint" [useTableX]="true" [hideTabs]="true"></client-vdse-yasgui>
    </client-vdse-page-content>
  `,
  styles: `
  .my-selectors {
    display: flex;
    gap: 1rem;
  }

  mat-form-field {
    min-width: 400px;
  }
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SparnaturalView implements AfterViewInit, OnInit {
  @ViewChild('sparnatural', { static: true })
  sparnatural!: ElementRef<SparNaturalElement>;

  @ViewChild(YasguiComponent, { static: false })
  yasgui!: YasguiComponent;

  lang = inject(TranslocoService).getActiveLang();
  ttl:string = '';
  debug = isDevMode();
  endpoint?: SparqlEndpoint;
  model?: MetaModel;
  modelOptions: MetaModel[] = [];

  private cdr = inject(ChangeDetectorRef);
  private registryService = inject(RegistryService);

  ngOnInit(): void {
    this.registryService.getEndpoints().subscribe(endpoints => {
      this.onEndpointChange(endpoints[0]);
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    const sparnatural = this.sparnatural.nativeElement;

    sparnatural.addEventListener('queryUpdated', event => {
      let query = (event as QueryUpdatedEvent).detail.queryString;
      query = sparnatural.expandSparql(query);
      this.yasgui.setQuery(query);
    });

    sparnatural.addEventListener('submit', event => {
      this.yasgui.runCurrentQuery();
    });

    sparnatural.addEventListener('reset', event => {
      this.yasgui.setQuery('');
    });
  }

  onEndpointChange(endpoint: SparqlEndpoint): void {
    this.endpoint = endpoint;
    this.registryService
      .getEndpoints()
      .pipe(
        switchMap(() => this.registryService.getModelsLinkedToSparqlEndpoint(endpoint)),
        // Because of timing issues in component initialization, we need to first give
        // dummy values for src and endpoint, then set the real ones
        // (and so we cannot prevent rendering with ngIf beforehand)
        delay(200)
      )
      .subscribe(shapesGraphs => {
        this.modelOptions = shapesGraphs;
        this.model = shapesGraphs[0];
        this.cdr.markForCheck();
        console.log("subscribe called")
        this.ttl = global_ttl;
      });
  }
}

interface QueryUpdatedEvent extends Event {
  detail: {
    queryString: string;
  };
}

interface SparNaturalElement extends HTMLElement {
  expandSparql(query: string): string;
}

