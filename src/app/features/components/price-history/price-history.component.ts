import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { Product, ProductService } from 'src/app/core/services/postgres/product/product.service';
import { NewProductDialogComponent } from '../dialog/new-product-dialog/new-product-dialog.component';

@Component({
  selector: 'app-price-history',
  templateUrl: './price-history.component.html',
  styleUrls: ['./price-history.component.css'],
})
export class PriceHistoryComponent implements OnInit {
  protected products: Product[] = [];
  protected hasLoaded = false;
  protected loadError = false;
  protected searchTerm = '';

  constructor(
    private productService: ProductService,
    private authService: AuthService,
    private modalService: NgbModal,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.productService.getAll().subscribe({
      next: (res) => {
        this.products = res.products;
        this.hasLoaded = true;
        this.loadError = false;
      },
      error: () => {
        this.hasLoaded = true;
        this.loadError = true;
      },
    });
  }

  protected get filtered(): Product[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.products;
    return this.products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.brand ?? '').toLowerCase().includes(term),
    );
  }

  protected retry(): void {
    this.hasLoaded = false;
    this.loadError = false;
    this.load();
  }

  protected openNewProduct(): void {
    const modal = this.modalService.open(NewProductDialogComponent, { centered: true });
    modal.result
      .then((created) => {
        if (!created) return;
        this.router.navigate(['/price-history', created.id]);
      })
      .catch(() => {});
  }

  protected goToDetail(product: Product): void {
    this.router.navigate(['/price-history', product.id]);
  }
}
