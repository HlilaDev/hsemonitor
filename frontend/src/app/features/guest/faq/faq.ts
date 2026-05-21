import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from "../components/header/header";
import { Footer } from "../components/footer/footer";

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, Header, Footer],
  templateUrl: './faq.html',
  styleUrl: './faq.scss',
})
export class Faq {
  activeIndex = signal<number | null>(null);

  faqs: FaqItem[] = [
    {
      question: 'Qu’est-ce que HSE Monitor ?',
      answer:
        'HSE Monitor est une plateforme SaaS intelligente permettant la surveillance en temps réel des environnements industriels grâce à des capteurs IoT et des modules d’intelligence artificielle.',
    },
    {
      question: 'Comment fonctionne la détection des risques ?',
      answer:
        'Les capteurs IoT collectent les données (température, gaz, etc.) tandis que les modules IA analysent les flux vidéo pour détecter les violations des équipements de protection individuelle (EPI).',
    },
    {
      question: 'Puis-je accéder à la plateforme depuis mobile ?',
      answer:
        'Oui, une application mobile permet aux agents et managers de recevoir des alertes en temps réel et de consulter les données à distance.',
    },
    {
      question: 'Quels sont les rôles disponibles ?',
      answer:
        'La plateforme propose plusieurs rôles : Agent, Supervisor, Manager, Admin et SuperAdmin, chacun avec des permissions spécifiques.',
    },
    {
      question: 'Comment sont envoyées les alertes ?',
      answer:
        'Les alertes sont transmises en temps réel via Socket.io ou MQTT selon l’architecture choisie.',
    },
  ];

  toggle(index: number) {
    this.activeIndex.set(this.activeIndex() === index ? null : index);
  }
}