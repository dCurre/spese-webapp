import { Component, OnInit } from '@angular/core';
import { UserRole, UserRoleService } from 'src/app/core/services/postgres/user-role/user-role.service';
import { ExpenseType, ExpenseTypeService } from 'src/app/core/services/postgres/expense-type/expense-type.service';
import { User } from 'src/app/core/services/postgres/user/user';
import { UserService } from 'src/app/core/services/postgres/user/user.service';
import { AuthService } from 'src/app/core/services/auth/auth.service';
import { ToastService } from 'src/app/core/services/toast/toast.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  roles: UserRole[] = [];
  expenseTypes: ExpenseType[] = [];
  users: User[] = [];
  loggedUser: User | null = null;

  newRoleName = '';
  newExpenseTypeName = '';

  copiedUserId: number | null = null;

  collapsed = { roles: false, types: false, users: false };

  editingRoleId: number | null = null;
  editingRoleName = '';

  editingTypeId: number | null = null;
  editingTypeName = '';

  constructor(
    private userRoleService: UserRoleService,
    private expenseTypeService: ExpenseTypeService,
    private userService: UserService,
    private authService: AuthService,
    private toastService: ToastService,
    private afAuth: AngularFireAuth,
  ) {}

  ngOnInit() {
    this.authService.getStoredUser().subscribe(u => this.loggedUser = u);
    this.loadRoles();
    this.loadTypes();
    this.loadUsers();
  }

  loadRoles() {
    this.userRoleService.getAll().subscribe({ next: (res) => this.roles = res.user_roles });
  }

  loadTypes() {
    this.expenseTypeService.getAll().subscribe({ next: (res) => this.expenseTypes = res.expense_types });
  }

  loadUsers() {
    this.userService.getAll().subscribe({
      next: (res) => {
        const visible = res.users.filter(u => u.email !== 'deleted@system.local');
        const me = visible.find(u => u.id === this.loggedUser?.id);
        const others = visible.filter(u => u.id !== this.loggedUser?.id);
        this.users = me ? [me, ...others] : others;
      }
    });
  }

  // ── Ruoli ──
  addRole() {
    const name = this.newRoleName.trim();
    if (!name) return;
    this.userRoleService.create(name).subscribe({ next: () => { this.newRoleName = ''; this.loadRoles(); } });
  }

  startEditRole(role: UserRole) {
    this.editingRoleId = role.id;
    this.editingRoleName = role.name;
  }

  saveRole(role: UserRole) {
    const name = this.editingRoleName.trim();
    if (!name) return;
    this.userRoleService.update(role.id, name).subscribe({ next: () => { this.editingRoleId = null; this.loadRoles(); } });
  }

  cancelEditRole() { this.editingRoleId = null; }

  deleteRole(role: UserRole) {
    this.userRoleService.delete(role.id).subscribe({ next: () => this.loadRoles() });
  }

  // ── Tipologie spesa ──
  addExpenseType() {
    const name = this.newExpenseTypeName.trim();
    if (!name) return;
    this.expenseTypeService.create(name).subscribe({ next: () => { this.newExpenseTypeName = ''; this.loadTypes(); } });
  }

  startEditType(t: ExpenseType) {
    this.editingTypeId = t.id;
    this.editingTypeName = t.name;
  }

  saveType(t: ExpenseType) {
    const name = this.editingTypeName.trim();
    if (!name) return;
    this.expenseTypeService.update(t.id, name).subscribe({ next: () => { this.editingTypeId = null; this.loadTypes(); } });
  }

  cancelEditType() { this.editingTypeId = null; }

  deleteType(t: ExpenseType) {
    this.expenseTypeService.delete(t.id).subscribe({ next: () => this.loadTypes() });
  }

  // ── Utenti ──
  roleIdByName(name: string | null): number | null {
    if (!name) return null;
    return this.roles.find(r => r.name === name)?.id ?? null;
  }

  canEditUser(targetUser: User): boolean {
    if (!this.loggedUser?.role) return false;
    if (this.loggedUser.id === targetUser.id) return false;
    const myRole = this.loggedUser.role;
    const targetRole = targetUser.role ?? 'user';
    if (myRole === 'superadmin') return targetRole !== 'superadmin';
    if (myRole === 'admin') return targetRole !== 'superadmin';
    return false;
  }

  assignableRoles(): UserRole[] {
    const myRole = this.loggedUser?.role;
    if (myRole === 'superadmin') return this.roles;
    if (myRole === 'admin') return this.roles.filter(r => r.name !== 'superadmin');
    return [];
  }

  async changeUserRole(user: User, roleId: number) {
    const firebaseUser = await this.afAuth.currentUser;
    this.userService.update(user.id, { role_id: roleId, caller_email: firebaseUser?.email } as any).subscribe({
      next: () => { user.role = this.roles.find(r => r.id === roleId)?.name as any ?? user.role; }
    });
  }

  copyUserEmail(user: User): void {
    navigator.clipboard.writeText(user.email).then(() => {
      this.copiedUserId = user.id;
      setTimeout(() => this.copiedUserId = null, 2000);
      this.toastService.success('Email copiata negli appunti');
    });
  }

  userInitials(user: User): string {
    return `${user.name?.[0] ?? ''}${user.surname?.[0] ?? ''}`.toUpperCase();
  }
}
