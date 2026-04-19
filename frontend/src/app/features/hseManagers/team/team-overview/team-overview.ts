import { CommonModule, DatePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserServices } from '../../../../core/services/users/user-services';

type TeamRole = 'manager' | 'agent' | 'supervisor' | 'admin' | 'superAdmin';

interface TeamApiMember {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: TeamRole;
  company?:
    | string
    | {
        _id?: string;
        name?: string;
        industry?: string;
      };
  createdAt?: string;
  updatedAt?: string;
}

interface GetTeamResponse {
  message: string;
  items: TeamApiMember[];
  count: number;
}

interface TeamMemberView {
  _id: string;
  fullName: string;
  email: string;
  role: TeamRole;
  companyName: string;
  createdAt?: string;
}

@Component({
  selector: 'app-team-overview',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './team-overview.html',
  styleUrl: './team-overview.scss',
})
export class TeamOverview implements OnInit {
  private userServices = inject(UserServices);

  loading = signal(true);
  error = signal<string | null>(null);

  search = signal('');
  selectedRole = signal<'all' | TeamRole>('all');
  viewMode = signal<'table' | 'cards'>('table');

  team = signal<TeamMemberView[]>([]);

  ngOnInit(): void {
    this.loadTeam();
  }

  loadTeam(): void {
    this.loading.set(true);
    this.error.set(null);

    this.userServices.getTeam().subscribe({
      next: (response: GetTeamResponse | TeamApiMember[] | any) => {
        const items: TeamApiMember[] = Array.isArray(response)
          ? response
          : response?.items || [];

        const mapped: TeamMemberView[] = items.map((member) => ({
          _id: member._id,
          fullName: `${member.firstName ?? ''} ${member.lastName ?? ''}`.trim(),
          email: member.email ?? '-',
          role: member.role,
          companyName:
            typeof member.company === 'object'
              ? member.company?.name || '-'
              : '-',
          createdAt: member.createdAt,
        }));

        this.team.set(mapped);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set(err.message || 'Failed to load team');
        this.team.set([]);
        this.loading.set(false);
      },
    });
  }

  filteredTeam = computed(() => {
    const q = this.search().trim().toLowerCase();
    const role = this.selectedRole();

    return this.team().filter((member) => {
      const matchesSearch =
        !q ||
        member.fullName.toLowerCase().includes(q) ||
        member.email.toLowerCase().includes(q) ||
        member.companyName.toLowerCase().includes(q) ||
        member.role.toLowerCase().includes(q);

      const matchesRole = role === 'all' || member.role === role;

      return matchesSearch && matchesRole;
    });
  });

  totalMembers = computed(() => this.team().length);
  managersCount = computed(
    () => this.team().filter((m) => m.role === 'manager').length
  );
  agentsCount = computed(
    () => this.team().filter((m) => m.role === 'agent').length
  );

  setView(mode: 'table' | 'cards'): void {
    this.viewMode.set(mode);
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }

  getRoleLabel(role: TeamRole): string {
    switch (role) {
      case 'manager':
        return 'Manager';
      case 'agent':
        return 'Agent';
      case 'supervisor':
        return 'Supervisor';
      case 'admin':
        return 'Admin';
      case 'superAdmin':
        return 'Super Admin';
      default:
        return role;
    }
  }

  trackById(index: number, item: TeamMemberView): string {
    return item._id;
  }
}