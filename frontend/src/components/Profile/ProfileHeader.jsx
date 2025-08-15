
import React, { useState, useRef } from 'react';
import { Card, CardBody, Row, Col, Media, Button, Spinner } from 'reactstrap';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { put } from '../../helpers/api_helper';
import useNotification from '../../hooks/useNotification';

const ProfileHeader = ({ user, onProfileUpdate }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { showSuccess, showError } = useNotification();

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('profileImage', file);

    try {
      await put('/api/users/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      showSuccess('Foto de perfil atualizada com sucesso!');
      onProfileUpdate(); // Recarregar dados do perfil
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
      showError('Falha ao fazer upload da foto.');
    } finally {
      setUploading(false);
    }
  };

  const defaultAvatar = "/assets/images/default-user-avatar.png"; // Local default user avatar

  return (
    <Card className="profile-header-card mb-4">
      <CardBody>
        <Row className="align-items-center">
          <Col md={3} className="text-center">
            <motion.div
              className="profile-avatar-container position-relative d-inline-block"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleImageClick}
              style={{ cursor: 'pointer' }}
            >
              <img
                src={user.avatar_url || defaultAvatar}
                alt="Avatar"
                className="rounded-circle avatar-lg img-thumbnail"
                style={{ width: '150px', height: '150px', objectFit: 'cover' }}
              />
              <motion.div
                className="profile-avatar-overlay position-absolute top-0 start-0 w-100 h-100 rounded-circle d-flex align-items-center justify-content-center"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                style={{ background: 'rgba(0,0,0,0.5)' }}
              >
                {uploading ? (
                  <Spinner size="sm" color="light" />
                ) : (
                  <FontAwesomeIcon icon={faCamera} size="2x" color="white" />
                )}
              </motion.div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ display: 'none' }}
                accept="image/*"
              />
            </motion.div>
          </Col>
          <Col md={9}>
            <Media body className="ms-4">
              <h3 className="mt-0 mb-1">{user.name}</h3>
              <p className="text-muted mb-2">{user.job_title || 'Cargo não definido'}</p>
              <p className="text-muted mb-0">{user.email}</p>
              {user.phone_number && <p className="text-muted mb-0">Telefone: {user.phone_number}</p>}
              {user.bio && <p className="text-muted mt-2">{user.bio}</p>}
            </Media>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default ProfileHeader;
