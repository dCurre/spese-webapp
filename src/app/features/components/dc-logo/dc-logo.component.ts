import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-dc-logo',
  templateUrl: './dc-logo.component.html',
  styleUrls: ['./dc-logo.component.css']
})
export class DcLogoComponent implements OnDestroy {

  replay(): void {
    const svg = document.getElementById('dcLogoSvg');
    if (svg) {
      const clone = svg.cloneNode(true) as SVGElement;
      (clone as unknown as HTMLElement).querySelectorAll<HTMLElement>('[data-replay]').forEach(el => {
        el.addEventListener('click', () => this.replay());
      });
      svg.parentNode?.replaceChild(clone, svg);
    }
  }

  ngOnDestroy(): void {}
}
