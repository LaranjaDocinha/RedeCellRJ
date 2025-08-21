// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div>{children}</div>,
  RouterProvider: ({ router }) => <div>{router.routes[0].element}</div>, // Simplified mock for RouterProvider
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
  NavLink: ({ children, to, ...rest }) => <a href={to} {...rest}>{children}</a>,
}));

// Mock reactstrap components that cause issues in tests
jest.mock('reactstrap', () => ({
  ...jest.requireActual('reactstrap'),
  CustomInput: (props) => <input type="checkbox" {...props} />,
  Input: (props) => <input {...props} />,
  Label: (props) => <label {...props}>{props.children}</label>,
  FormGroup: (props) => <div {...props}>{props.children}</div>,
  Card: (props) => <div {...props}>{props.children}</div>,
  CardBody: (props) => <div {...props}>{props.children}</div>,
  CardTitle: (props) => <h5 {...props}>{props.children}</h5>,
  CardSubtitle: (props) => <h6 {...props}>{props.children}</h6>,
  Badge: (props) => <span {...props}>{props.children}</span>,
  Button: (props) => <button {...props}>{props.children}</button>,
  Row: (props) => <div {...props}>{props.children}</div>,
  Col: (props) => <div {...props}>{props.children}</div>,
  Alert: (props) => <div {...props}>{props.children}</div>,
  Spinner: (props) => <div {...props}>Loading...</div>,
  Modal: (props) => <div {...props}>{props.children}</div>,
  ModalHeader: (props) => <div {...props}>{props.children}</div>,
  ModalBody: (props) => <div {...props}>{props.children}</div>,
  ModalFooter: (props) => <div {...props}>{props.children}</div>,
  Nav: (props) => <nav {...props}>{props.children}</nav>,
  NavItem: (props) => <li {...props}>{props.children}</li>,
  NavLink: (props) => <a {...props}>{props.children}</a>,
  TabContent: (props) => <div {...props}>{props.children}</div>,
  TabPane: (props) => <div {...props}>{props.children}</div>,
  Tooltip: (props) => <div {...props}>{props.children}</div>,
  Collapse: (props) => <div {...props}>{props.children}</div>,
  Table: (props) => <table {...props}>{props.children}</table>,
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    img: ({ children, ...props }) => <img {...props}>{children}</img>,
    p: ({ children, ...props }) => <p {...props}>{children}</p>,
    li: ({ children, ...props }) => <li {...props}>{children}</li>,
    i: ({ children, ...props }) => <i {...props}>{children}</i>,
    ul: ({ children, ...props }) => <ul {...props}>{children}</ul>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => children,
}));

// Mock @hello-pangea/dnd
jest.mock('@hello-pangea/dnd', () => ({
  DragDropContext: ({ children, onDragEnd }) => {
    // Mock onDragEnd to be callable for testing
    return <div data-testid="DragDropContext" onClick={() => onDragEnd({ source: { droppableId: 'mockSource', index: 0 }, destination: { droppableId: 'mockDestination', index: 0 }, draggableId: 'mockDraggable' })}>{children}</div>;
  },
  Droppable: ({ children, droppableId }) => {
    return children(
      {
        innerRef: jest.fn(),
        droppableProps: { 'data-droppable-id': droppableId },
        placeholder: null,
      },
      { isDraggingOver: false }
    );
  },
  Draggable: ({ children, draggableId, index }) => {
    return children(
      {
        innerRef: jest.fn(),
        draggableProps: { 'data-draggable-id': draggableId, 'data-index': index, style: {} },
        dragHandleProps: {},
      },
      { isDragging: false }
    );
  },
}));

// Mock @dnd-kit/core and @dnd-kit/sortable
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }) => <div>{children}</div>,
  closestCenter: jest.fn(),
  KeyboardSensor: jest.fn(),
  PointerSensor: jest.fn(),
  useSensor: jest.fn(() => ({})),
  useSensors: jest.fn(() => ([{}])),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }) => <div>{children}</div>,
  sortableKeyboardCoordinates: jest.fn(),
  verticalListSortingStrategy: jest.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
    transition: '',
  }),
}));

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: jest.fn(() => ''),
    },
  },
}));

// Mock useApi hook
jest.mock('./hooks/useApi', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    loading: false,
    request: jest.fn(() => Promise.resolve()),
  })),
}));

// Mock api_helper
jest.mock('./helpers/api_helper', () => ({
  get: jest.fn(() => Promise.resolve()),
  post: jest.fn(() => Promise.resolve()),
  put: jest.fn(() => Promise.resolve()),
  del: jest.fn(() => Promise.resolve()),
  publicGet: jest.fn(() => Promise.resolve()),
}));

// Mock react-to-print
jest.mock('react-to-print', () => ({
  useReactToPrint: jest.fn(() => jest.fn()),
}));

// Mock react-number-format
jest.mock('react-number-format', () => ({
  NumericFormat: (props) => <input type="text" {...props} />,
}));

// Mock react-color
jest.mock('react-color', () => ({
  ChromePicker: (props) => <div {...props} />,
}));

// Mock zustand
jest.mock('zustand', () => ({
  create: jest.fn((fn) => fn()),
}));

jest.mock('zustand/middleware', () => ({
  persist: jest.fn((fn) => fn),
  createJSONStorage: jest.fn(() => ({
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  })),
}));

// Mock useAuthStore
jest.mock('./store/authStore', () => ({
  useAuthStore: {
    getState: () => ({
      user: { id: 1, name: 'Test User', role: 'admin' },
      token: 'mock-token',
      originalToken: 'mock-original-token',
    }),
    setState: jest.fn(),
    subscribe: jest.fn(),
    destroy: jest.fn(),
  },
}));

// Mock useTheme
jest.mock('./context/ThemeContext', () => ({
  useTheme: () => ({
    theme: 'light',
    setPrimaryColor: jest.fn(),
    setPrimaryFont: jest.fn(),
    setSecondaryFont: jest.fn(),
  }),
}));

// Mock toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  loading: jest.fn(),
  dismiss: jest.fn(),
}));

// Mock lodash.debounce
jest.mock('lodash', () => ({
  debounce: jest.fn((fn) => fn),
}));

// Mock useNotification
jest.mock('./hooks/useNotification', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    showSuccess: jest.fn(),
    showError: jest.fn(),
    showInfo: jest.fn(),
  })),
}));

// Mock useBreadcrumbs
jest.mock('use-react-router-breadcrumbs', () => ({
  __esModule: true,
  default: jest.fn(() => ([
    { match: { pathname: '/' }, breadcrumb: 'Home' },
    { match: { pathname: '/settings' }, breadcrumb: 'Settings' },
  ])),
}));