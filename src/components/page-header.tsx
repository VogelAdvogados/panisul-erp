import type { FC, ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  children?: ReactNode;
}

const PageHeader: FC<PageHeaderProps> = ({ title, children }) => {
  return (
    <div className="flex items-center justify-between space-y-2">
      <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">
        {title}
      </h1>
      <div className="flex items-center space-x-2">{children}</div>
    </div>
  );
};

export default PageHeader;
