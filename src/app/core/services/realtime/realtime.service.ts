import { Injectable, OnDestroy } from '@angular/core';
import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

type Table = 'shopping_items' | 'shopping_categories' | 'shopping_lists' | 'expenses' | 'expenses_lists';

@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {

  private supabase: SupabaseClient = createClient(environment.supabaseUrl, environment.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  private channels = new Map<string, { channel: RealtimeChannel; subject: Subject<any>; refs: number }>();

  /** Ritorna un Observable che emette il payload ogni volta che la tabella specificata cambia. */
  watch(table: Table, schema = 'spese'): Observable<any> {
    const key = `${schema}:${table}`;

    if (!this.channels.has(key)) {
      const subject = new Subject<any>();
      const channelConfig: any = { event: '*', schema, table };

      const channel = this.supabase
        .channel(key)
        .on('postgres_changes', channelConfig, (payload: any) => subject.next(payload))
        .subscribe();

      this.channels.set(key, { channel, subject, refs: 0 });
    }

    const entry = this.channels.get(key)!;
    entry.refs++;

    return new Observable<any>(observer => {
      const sub = entry.subject.subscribe(observer);
      return () => {
        sub.unsubscribe();
        entry.refs--;
        if (entry.refs === 0) {
          this.supabase.removeChannel(entry.channel);
          this.channels.delete(key);
        }
      };
    });
  }

  ngOnDestroy(): void {
    this.channels.forEach(({ channel }) => this.supabase.removeChannel(channel));
    this.channels.clear();
  }
}
