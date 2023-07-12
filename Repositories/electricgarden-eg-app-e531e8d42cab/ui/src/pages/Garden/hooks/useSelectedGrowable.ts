import React, { useContext } from 'react';

export const GrowableContext = React.createContext(
    (null as any) as ServerGrowable,
);

export const useSelectedGrowable = () => useContext(GrowableContext);
