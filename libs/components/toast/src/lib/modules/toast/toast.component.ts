import { AnimationEvent } from '@angular/animations';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { skyAnimationEmerge } from '@skyux/animations';
import { SkyIconStackItem } from '@skyux/indicators';

import { Subject, combineLatest } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { SkyToasterService } from './toaster.service';
import { SkyToastType } from './types/toast-type';

const AUTO_CLOSE_MILLISECONDS = 6000;
const SKY_TOAST_TYPE_DEFAULT = SkyToastType.Info;

/**
 * @internal
 */
@Component({
  selector: 'sky-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss'],
  animations: [skyAnimationEmerge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class SkyToastComponent implements OnInit, OnDestroy {
  /**
   * Whether to automatically close the toast. Only close toasts
   * automatically if users can access the messages after the toasts close.
   */
  @Input()
  public autoClose: boolean | undefined;

  /**
   * The `SkyToastType` type for the toast to determine the color and icon to display.
   */
  @Input()
  public set toastType(value: SkyToastType | undefined) {
    this.toastTypeOrDefault =
      value === undefined ? SKY_TOAST_TYPE_DEFAULT : value;
    this.#updateForToastType();
  }

  /**
   * Fires when the toast closes.
   */
  @Output()
  public closed = new EventEmitter<void>();

  public get isOpen(): boolean {
    return this.#isOpen;
  }

  public ariaLive = 'polite';
  public ariaRole: string | undefined;
  public baseIcon: SkyIconStackItem | undefined;
  public classNames = '';
  public icon: string | undefined;
  public toastTypeOrDefault: SkyToastType = SKY_TOAST_TYPE_DEFAULT;
  public topIcon: SkyIconStackItem | undefined;

  #autoCloseTimeoutId: unknown;
  #isOpen = false;
  #ngUnsubscribe = new Subject<void>();

  #changeDetector: ChangeDetectorRef;
  #toasterService: SkyToasterService | undefined;

  constructor(
    changeDetector: ChangeDetectorRef,
    @Optional() toasterService?: SkyToasterService
  ) {
    this.#changeDetector = changeDetector;
    this.#toasterService = toasterService;
  }

  public ngOnInit(): void {
    this.#isOpen = true;

    this.startAutoCloseTimer();

    if (this.#toasterService) {
      combineLatest([
        this.#toasterService.focusIn,
        this.#toasterService.mouseOver,
      ])
        .pipe(takeUntil(this.#ngUnsubscribe))
        .subscribe(([hasFocus, hasMouseOver]) => {
          if (hasFocus || hasMouseOver) {
            this.stopAutoCloseTimer();
          } else {
            this.startAutoCloseTimer();
          }
        });
    }

    this.#updateForToastType();
  }

  public ngOnDestroy(): void {
    this.#ngUnsubscribe.next();
    this.#ngUnsubscribe.complete();

    this.stopAutoCloseTimer();
  }

  public onAnimationDone(event: AnimationEvent): void {
    if (event.toState === 'closed') {
      this.closed.emit();
      this.closed.complete();
    }
  }

  public close(): void {
    this.stopAutoCloseTimer();

    this.#isOpen = false;
    this.#changeDetector.markForCheck();
  }

  public startAutoCloseTimer(): void {
    if (
      this.autoClose &&
      (!this.#toasterService ||
        (!this.#toasterService.focusIn.getValue() &&
          !this.#toasterService.mouseOver.getValue()))
    ) {
      this.stopAutoCloseTimer();

      this.#autoCloseTimeoutId = setTimeout(() => {
        this.close();
      }, AUTO_CLOSE_MILLISECONDS);
    }
  }

  public stopAutoCloseTimer(): void {
    if (this.#autoCloseTimeoutId) {
      clearTimeout(this.#autoCloseTimeoutId as number);
    }
  }

  #updateForToastType(): void {
    let icon: string;
    let baseIcon: string;
    let topIcon: string;

    switch (this.toastTypeOrDefault) {
      case SkyToastType.Danger:
      case SkyToastType.Warning:
        icon = 'warning';
        baseIcon = 'triangle-solid';
        topIcon = 'exclamation';
        break;
      case SkyToastType.Info:
        icon = 'exclamation-circle';
        baseIcon = 'circle-solid';
        topIcon = 'help-i';
        break;
      case SkyToastType.Success:
        icon = 'check';
        baseIcon = 'circle-solid';
        topIcon = 'check';
        break;
    }

    this.baseIcon = {
      icon: baseIcon,
      iconType: 'skyux',
    };

    this.topIcon = {
      icon: topIcon,
      iconType: 'skyux',
    };

    this.icon = icon;

    this.ariaLive =
      this.toastTypeOrDefault === SkyToastType.Danger ? 'assertive' : 'polite';
    this.ariaRole =
      this.toastTypeOrDefault === SkyToastType.Danger ? 'alert' : undefined;

    let typeLabel: string;
    switch (this.toastTypeOrDefault) {
      case SkyToastType.Danger:
        typeLabel = 'danger';
        break;

      case SkyToastType.Info:
      default:
        typeLabel = 'info';
        break;

      case SkyToastType.Success:
        typeLabel = 'success';
        break;

      case SkyToastType.Warning:
        typeLabel = 'warning';
        break;
    }

    this.classNames = `sky-toast-${typeLabel}`;
  }
}
