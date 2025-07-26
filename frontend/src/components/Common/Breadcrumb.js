import { useEffect } from 'react';
import { useBreadcrumb } from '../../context/BreadcrumbContext';

const Breadcrumb = ({ breadcrumbItem = '' }) => {
  const { setBreadcrumbTitle } = useBreadcrumb();

  useEffect(() => {
    setBreadcrumbTitle(breadcrumbItem);
    
    // Cleanup function to clear the title when the component unmounts
    return () => {
      setBreadcrumbTitle('');
    };
  }, [breadcrumbItem, setBreadcrumbTitle]);

  return null; // This component no longer renders anything itself
};

export default Breadcrumb;
