import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-supervisor-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './supervisor-dashboard.html',
  styleUrl: './supervisor-dashboard.scss',
})
export class SupervisorDashboard {
  stats = [
    {
      title: 'Observations',
      value: 24,
      icon: 'bi bi-eye',
      trend: '+12%',
      positive: true,
      description: 'Observations enregistrées cette semaine',
    },
    {
      title: 'Incidents',
      value: 7,
      icon: 'bi bi-exclamation-triangle',
      trend: '-5%',
      positive: true,
      description: 'Incidents déclarés et suivis',
    },
    {
      title: 'Audits',
      value: 15,
      icon: 'bi bi-clipboard-check',
      trend: '+8%',
      positive: true,
      description: 'Audits planifiés ou terminés',
    },
    {
      title: 'Inspections',
      value: 18,
      icon: 'bi bi-ui-checks-grid',
      trend: '+6%',
      positive: true,
      description: 'Inspections de sécurité actives',
    },
  ];

  quickActions = [
    {
      title: 'Observations',
      subtitle: 'Consulter les observations terrain',
      icon: 'bi bi-eye',
      route: '/supervisor/observations',
    },
    {
      title: 'Incidents',
      subtitle: 'Suivre les incidents HSE',
      icon: 'bi bi-exclamation-octagon',
      route: '/supervisor/incidents',
    },
    {
      title: 'Audits',
      subtitle: 'Voir les audits programmés',
      icon: 'bi bi-clipboard-check',
      route: '/supervisor/audits',
    },
    {
      title: 'Inspections',
      subtitle: 'Accéder aux inspections',
      icon: 'bi bi-ui-checks-grid',
      route: '/supervisor/inspections',
    },
    {
      title: 'Trainings',
      subtitle: 'Suivre les formations',
      icon: 'bi bi-mortarboard',
      route: '/supervisor/trainings',
    },
    {
      title: 'Notifications',
      subtitle: 'Voir les alertes récentes',
      icon: 'bi bi-bell',
      route: '/supervisor/notifications',
    },
  ];

  recentActivities = [
    {
      title: 'Nouvelle observation créée',
      description: 'Zone B - Port du casque non conforme détecté.',
      time: 'Il y a 10 min',
      type: 'warning',
    },
    {
      title: 'Inspection validée',
      description: 'Inspection du bloc logistique terminée avec succès.',
      time: 'Il y a 35 min',
      type: 'success',
    },
    {
      title: 'Incident signalé',
      description: 'Glissade mineure signalée dans l’atelier principal.',
      time: 'Il y a 1 h',
      type: 'danger',
    },
    {
      title: 'Formation programmée',
      description: 'Session sécurité incendie prévue demain à 09:00.',
      time: 'Aujourd’hui',
      type: 'info',
    },
  ];

  teamStatus = [
    {
      label: 'Zones surveillées',
      value: '08',
    },
    {
      label: 'Agents actifs',
      value: '14',
    },
    {
      label: 'Alertes ouvertes',
      value: '05',
    },
    {
      label: 'Conformité moyenne',
      value: '93%',
    },
  ];
}