import { Component, HostListener, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Clipboard } from '@angular/cdk/clipboard';
import StringUtils from 'src/app/utils/string-utils';

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.css']
})
export class ShareDialogComponent implements OnInit {

  @Input() shareLink: string;
  protected linkCopiato = "";

  constructor(public modalService: NgbActiveModal,
    private clipboard: Clipboard,) { }

  ngOnInit(): void {
  }

  copyLinkToClipboard() {
    this.linkCopiato = "";
    this.clipboard.copy(this.shareLink);
    this.linkCopiato = "LinkCopiato";
  }

  replaceChars(string: string) {
    return StringUtils.replaceSpecialCharsForLinks(string);
  }
}
