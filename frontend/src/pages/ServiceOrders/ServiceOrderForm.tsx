import React, { useState, useEffect } from 'react';
import { ImeiInput } from '../../components/ImeiInput';
import { useNotification } from '../../hooks/useNotification';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { db } from '../../db'; // Importar db para acessar offlineServiceOrders
import { sendOfflineRequest, syncOfflineRequests } from '../../utils/offlineApi'; // Importar sendOfflineRequest e syncOfflineRequests
import { FaWifi } from 'react-icons/fa'; // Importar ícones de Wi-Fi

interface Customer {
  id: number;
  name: string;
}

const ServiceOrderForm: React.FC = () => {
  const { addNotification } = useNotification();
  const { token } = useAuth();
  const { t } = useTranslation();

  const [customer_id, setCustomerId] = useState<number | ''>('');
  const [product_description, setProductDescription] = useState('');
  const [imei, setImei] = useState('');
  const [issue_description, setIssueDescription] = useState('');
  const [entry_checklist, setEntryChecklist] = useState<Record<string, boolean>>({
    liga: false,
    tela: false,
    botoes: false,
  });
  const [customers, setCustomers] = useState<Customer[]>([]); // State for customers
  const [isOnline, setIsOnline] = useState(navigator.onLine); // Estado para status online/offline
  const [pendingOfflineServiceOrders, setPendingOfflineServiceOrders] = useState(0); // Novo estado para O.S. pendentes

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch('http://localhost:5000/customers', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        const data = await response.json();
        setCustomers(data);
      } catch (error) {
        console.error('Error fetching customers:', error);
        addNotification(t('failed_to_load_customers'), 'error');
      }
    };
    fetchCustomers();
  }, [token, addNotification, t]);

  // Atualiza o status online/offline e a contagem de O.S. pendentes
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      await syncOfflineRequests('offlineServiceOrders'); // Tenta sincronizar ao voltar online
      updatePendingServiceOrdersCount();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const updatePendingServiceOrdersCount = async () => {
      const count = await db.offlineServiceOrders.where('synced').equals(false).count();
      setPendingOfflineServiceOrders(count);
    };

    updatePendingServiceOrdersCount(); // Atualiza a contagem inicial
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!customer_id || !product_description || !issue_description) {
      addNotification(t('fill_all_required_fields'), 'warning');
      return;
    }

    const serviceOrderData = {
      customer_id: Number(customer_id),
      product_description,
      imei: imei || undefined,
      issue_description,
      entry_checklist,
    };

    try {
      const result = await sendOfflineRequest(
        'http://localhost:5000/service-orders',
        'POST',
        serviceOrderData,
        'offlineServiceOrders',
        { 'Authorization': `Bearer ${token}` }
      );

      if (result.message === 'Request saved offline') {
        addNotification(t('service_order_saved_offline'), 'info');
      } else {
        addNotification(t('service_order_created_successfully'), 'success');
      }

      // Clear form
      setCustomerId('');
      setProductDescription('');
      setImei('');
      setIssueDescription('');
      setEntryChecklist({ liga: false, tela: false, botoes: false });
      const count = await db.offlineServiceOrders.where('synced').equals(false).count();
      setPendingOfflineServiceOrders(count);
    } catch (error: any) {
      addNotification(t('failed_to_create_service_order', { message: error.message }), 'error');
    }
  };

  const handleChecklistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEntryChecklist({
      ...entry_checklist,
      [e.target.id]: e.target.checked,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h2>{t('new_service_order')}</h2>
        {isOnline ? (
          <FaWifi style={{ color: 'green' }} title={t('online_status')} />
        ) : (
          <FaWifi style={{ color: 'red' }} title={t('offline_status')} />
        )}
        {pendingOfflineServiceOrders > 0 && (
          <span style={{ color: 'orange', fontWeight: 'bold' }} title={t('pending_offline_service_orders', { count: pendingOfflineServiceOrders })}>
            ({pendingOfflineServiceOrders} {t('pending_service_orders')})
          </span>
        )}
      </div>

      <div>
        <label>{t('customer')}</label>
        <select value={customer_id} onChange={(e) => setCustomerId(Number(e.target.value))}>
          <option value="">{t('select_customer')}</option>
          {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label>{t('product_description')}</label>
        <input
          type="text"
          placeholder={t('product_description_placeholder')}
          value={product_description}
          onChange={(e) => setProductDescription(e.target.value)}
        />
      </div>

      <ImeiInput label={t('imei')} onChange={setImei} value={imei} />

      <div>
        <label>{t('issue_description')}</label>
        <textarea
          value={issue_description}
          onChange={(e) => setIssueDescription(e.target.value)}
        />
      </div>

      <fieldset>
        <legend>{t('entry_checklist')}</legend>
        <div><input type="checkbox" id="liga" checked={entry_checklist.liga} onChange={handleChecklistChange} /><label htmlFor="liga">{t('turns_on')}</label></div>
        <div><input type="checkbox" id="tela" checked={entry_checklist.tela} onChange={handleChecklistChange} /><label htmlFor="tela">{t('screen_intact')}</label></div>
        <div><input type="checkbox" id="botoes" checked={entry_checklist.botoes} onChange={handleChecklistChange} /><label htmlFor="botoes">{t('buttons_work')}</label></div>
      </fieldset>

      <div>
        <label>{t('technical_report')}</label>
        <textarea placeholder={t('technical_report_placeholder')} readOnly />
      </div>

      <button type="button">{t('start_guided_diagnosis')}</button>

      <div>
        <label>{t('budget')}</label>
        <input type="number" step="0.01" readOnly />
      </div>

      <div>
        <label>{t('upload_photos')}</label>
        <input type="file" multiple readOnly />
      </div>

      <button type="submit">{t('save_service_order')}</button>
    </form>
  );
};

export default ServiceOrderForm;
