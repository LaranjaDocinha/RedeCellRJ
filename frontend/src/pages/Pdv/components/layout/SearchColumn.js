import React from 'react';
import { Card, CardBody, CardTitle, FormGroup, Label, Input, Button } from 'reactstrap';

const SearchColumn = ({
  isPdvDisabled,
  selectedCustomer,
  customerSearch,
  setCustomerSearch,
  setSelectedCustomer,
  setCustomerModalOpen,
  productSearch,
  setProductSearch,
  searchProducts,
  barcodeSearch,
  setBarcodeSearch,
  barcodeSearchInputRef,
}) => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <Card className="h-100">
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-4">
            <CardTitle className="mb-0">Ações e Busca</CardTitle>
            <div>
                <Button size="sm" outline title="Vendas Suspensas" className="me-2">
                    <i className="bx bx-pause"></i>
                </Button>
                <Button size="sm" outline title="Tela Cheia" onClick={toggleFullscreen}>
                    <i className="bx bx-fullscreen"></i>
                </Button>
            </div>
        </div>

        {/* Customer Search */}
        <FormGroup>
          <Label for="customerSearch">
            <i className="bx bx-user-circle me-1"></i>Cliente (F2)
          </Label>
          <Input
            type="text"
            id="customerSearch"
            value={selectedCustomer ? selectedCustomer.name : customerSearch}
            onChange={(e) => {
              setCustomerSearch(e.target.value);
              setSelectedCustomer(null);
            }}
            onFocus={() => setCustomerModalOpen(true)}
            placeholder="Nome ou CPF"
            disabled={isPdvDisabled}
          />
          {selectedCustomer && (
            <div className="mt-2">
              <p className="mb-1 font-size-14">
                Selecionado: <strong>{selectedCustomer.name}</strong>
              </p>
              <Button close onClick={() => setSelectedCustomer(null)} title="Remover Cliente" />
            </div>
          )}
        </FormGroup>

        <hr />

        {/* Product Search */}
        <FormGroup className="mt-3">
          <Label for="productSearch">
            <i className="bx bx-search-alt me-1"></i>Buscar Produto (F1)
          </Label>
          <Input
            type="text"
            id="productSearch"
            value={productSearch}
            onChange={(e) => {
              setProductSearch(e.target.value);
              searchProducts(e.target.value);
            }}
            placeholder="Nome do produto"
            disabled={isPdvDisabled}
          />
        </FormGroup>

        <FormGroup className="mt-3">
          <Label for="barcodeSearch">
            <i className="bx bx-barcode-reader me-1"></i>Código de Barras
          </Label>
          <Input
            type="text"
            id="barcodeSearch"
            value={barcodeSearch}
            onChange={(e) => {
              setBarcodeSearch(e.target.value);
              searchProducts(e.target.value, true);
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                searchProducts(barcodeSearch, true);
              }
            }}
            innerRef={barcodeSearchInputRef}
            placeholder="Leia o código de barras"
            disabled={isPdvDisabled}
          />
        </FormGroup>

        <hr />

        {/* Product Categories */}
        <div className="mt-4">
            <h5 className="font-size-14 mb-3">
                <i className="bx bx-category-alt me-1"></i>Categorias
            </h5>
            <div className="d-flex flex-wrap gap-2">
                <Button color="light" outline>Bebidas</Button>
                <Button color="light" outline>Eletrônicos</Button>
                <Button color="light" outline>Serviços</Button>
                <Button color="light" outline>Outros</Button>
            </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default SearchColumn;
