import type { FC, ReactNode } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

const PageHeader: FC<PageHeaderProps> = ({ title, children }) => {
  const currentDate = format(new Date(), "eeee, dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="flex items-center justify-between space-y-2 mb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground capitalize">
          {currentDate}
        </p>
      </div>
      <div className="flex items-center space-x-2">{children}</div>
    </div>
  );
};

export default PageHeader;
