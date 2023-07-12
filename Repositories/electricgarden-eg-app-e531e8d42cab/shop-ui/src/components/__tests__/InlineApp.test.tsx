import React from 'react';
import ReactDOM from 'react-dom';
import { InlineApp } from '../InlineApp';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<InlineApp />, div);
  ReactDOM.unmountComponentAtNode(div);
});
