import { whatsappService } from '../src/services/whatsappService.js';
import 'dotenv/config';

async function seedTemplates() {
  console.log('Seeding Whatsapp Templates...');

  await whatsappService.upsertTemplate(
    'sale_created',
    'Olá {{name}}, obrigado pela preferência! Sua compra de R$ {{total}} foi confirmada. Volte sempre!'
  );

  await whatsappService.upsertTemplate(
    'os_created',
    'Olá {{name}}! Recebemos seu {{device}} para análise (OS #{{os_id}}). Você pode acompanhar o status em tempo real pelo link: {{link}}'
  );

  await whatsappService.upsertTemplate(
    'os_status_changed',
    'Atualização da OS #{{os_id}}: O status mudou para *{{status}}*. {{notes}}'
  );

  await whatsappService.upsertTemplate(
    'os_ready',
    'Boas notícias, {{name}}! Seu {{device}} está pronto. Valor do reparo: R$ {{total}}. Venha retirar em nossa loja!'
  );

  console.log('Templates seeded successfully!');
  process.exit(0);
}

seedTemplates().catch(err => {
  console.error(err);
  process.exit(1);
});
