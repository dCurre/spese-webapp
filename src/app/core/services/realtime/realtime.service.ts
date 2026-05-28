import { Injectable, OnDestroy } from '@angular/core';
import { createClient, RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

type Table = 'shopping_items' | 'shopping_categories' | 'shopping_lists' | 'expenses' | 'expenses_lists';

@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {

  private supabase: SupabaseClient = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  private channels = new Map<string, { channel: RealtimeChannel; subject: Subject<void>; refs: number }>();

  /** Ritorna un Observable che emette ogni volta che la tabella/riga specificata cambia. */
  watch(table: Table, schema = 'spese', filter?: string): Observable<void> {
    const key = filter ? `${schema}:${table}:${filter}` : `${schema}:${table}`;

    if (!this.channels.has(key)) {
      const subject = new Subject<void>();
      const channelConfig: any = { event: '*', schema, table };
      if (filter) channelConfig.filter = filter;

      const channel = this.supabase
        .channel(key)
        .on('postgres_changes', channelConfig, () => subject.next())
        .subscribe();

      this.channels.set(key, { channel, subject, refs: 0 });
    }

    const entry = this.channels.get(key)!;
    entry.refs++;

    return new Observable<void>(observer => {
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
