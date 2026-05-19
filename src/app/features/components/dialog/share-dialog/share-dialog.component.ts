import { Component, HostListener, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Clipboard } from '@angular/cdk/clipboard';
import StringUtils from 'src/app/shared/utils/string-utils';

@Component({
  selector: 'app-share-dialog',
  templateUrl: './share-dialog.component.html',
  styleUrls: ['./share-dialog.component.css']
})
export class ShareDialogComponent implements OnInit {

  @Input() shareLink: string;
  protected copied = false;

  constructor(public modalService: NgbActiveModal, private clipboard: Clipboard) {}

  ngOnInit(): void {}

  copyLinkToClipboard() {
    this.clipboard.copy(this.shareLink);
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }

  replaceChars(string: string) {
    return StringUtils.replaceSpecialCharsForLinks(string);
  }
}
