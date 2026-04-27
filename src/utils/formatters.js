export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('pt-BR').format(date);
};

export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatPercentage = (value) => {
  return `${value}%`;
};

export const timeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  const diffInDays = Math.floor(diffInSeconds / 86400);

  if (diffInDays === 0) return 'hoje';
  if (diffInDays === 1) return 'ontem';
  return `há ${diffInDays} dia(s)`;
};

export const truncateText = (text, length) => {
  if (!text || text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export const groupBy = (array, key) => {
  return array.reduce((acc, item) => {
    const group = item[key];
    acc[group] = acc[group] || [];
    acc[group].push(item);
    return acc;
  }, {});
};

export const removeDuplicates = (array) => {
  return [...new Set(array)];
};

export const paginate = (array, pageSize, pageNumber) => {
  return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generateProposalNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).padStart(3, '0');
  return `PROP-${year}${month}-${random}`;
};

export const getStatusColor = (status) => {
  const colors = {
    'Aceita': '#10b981',
    'Rascunho': '#64748b',
    'Pendente': '#f59e0b',
    'Recusada': '#ef4444'
  };
  return colors[status] || '#64748b';
};

export const getStatusEmoji = (status) => {
  const emojis = {
    'Aceita': '✅',
    'Rascunho': '📝',
    'Pendente': '⏳',
    'Recusada': '❌'
  };
  return emojis[status] || '📄';
};
