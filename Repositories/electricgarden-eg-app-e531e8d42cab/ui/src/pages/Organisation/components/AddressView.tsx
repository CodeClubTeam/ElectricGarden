import React from 'react';

export const AddressView: React.FC<{ address: Address }> = ({
    address: { line1, line2, line3, postcode, city, country },
}) => (
    <div>
        <h4>Address</h4>
        <dl>
            <dt>Line 1</dt>
            <dd>{line1}</dd>
            <dt>Line 2</dt>
            <dd>{line2}</dd>
            <dt>Line 3</dt>
            <dd>{line3}</dd>
            <dt>City</dt>
            <dd>{city}</dd>
            <dt>Postcode</dt>
            <dd>{postcode}</dd>
            <dt>Country</dt>
            <dd>{country}</dd>
        </dl>
    </div>
);
