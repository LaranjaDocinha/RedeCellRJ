import PropTypes from 'prop-types';

import { useFeatureFlags } from '../../context/FeatureFlagContext';

/**
 * Este componente atua como um portão. Ele só renderiza os seus filhos
 * se a feature flag especificada estiver ativa e o contexto não estiver carregando.
 */
const FeatureGate = ({ children, flag }) => {
  const { flags, isLoading } = useFeatureFlags();

  // Não renderiza nada enquanto as flags estão sendo carregadas
  if (isLoading) {
    return null;
  }

  // Renderiza os filhos apenas se a flag for verdadeira
  return flags[flag] ? children : null;
};

FeatureGate.propTypes = {
  children: PropTypes.node.isRequired,
  flag: PropTypes.string.isRequired,
};

export default FeatureGate;
