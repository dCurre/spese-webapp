import { trigger, transition, style, animate, query, group } from '@angular/animations';

export const slideAnimation = trigger('routeAnimations', [
  transition('signin => signup', [
    query(':enter, :leave', style({ position: 'absolute', width: '100%', top: 0, left: 0 }), { optional: true }),
    group([
      query(':leave', animate('300ms ease', style({ opacity: 0, transform: 'translateX(-40px)' })), { optional: true }),
      query(':enter', [
        style({ opacity: 0, transform: 'translateX(40px)' }),
        animate('300ms ease', style({ opacity: 1, transform: 'translateX(0)' }))
      ], { optional: true }),
    ])
  ]),
  transition('signup => signin', [
    query(':enter, :leave', style({ position: 'absolute', width: '100%', top: 0, left: 0 }), { optional: true }),
    group([
      query(':leave', animate('300ms ease', style({ opacity: 0, transform: 'translateX(40px)' })), { optional: true }),
      query(':enter', [
        style({ opacity: 0, transform: 'translateX(-40px)' }),
        animate('300ms ease', style({ opacity: 1, transform: 'translateX(0)' }))
      ], { optional: true }),
    ])
  ]),
]);
