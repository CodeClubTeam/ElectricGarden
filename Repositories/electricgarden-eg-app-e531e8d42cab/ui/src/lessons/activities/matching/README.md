# Matching Activity

## Purpose

The Matching activity is designed for assessment scenarios where you are asking
the learner to match two sets together.

## Terms

We have multiple terms we need to understand for the rest of this document and the API.

-   **Target** an item to be matched.
-   **Candidate** an item that can be matched to a Target.
-   **Match** a correct Target and Candidate combination. This is includes the visual display of it.
-   **Set** similar items grouped together. We have **Candidates**, **Targets** and **Matches**.
-   **Sets** the top level visual Set with the Candidates and Targets.

## Basic Concepts

You need to specify sets of Targets and Candidates.

Within the Targets you will have Matches where you can specify
the correct Candidate(s).

For the unmatchable Candidates (if any) you use the `unmatched` element.

### Basic Example

```jsx
<MatchingActivity
    unmatched={[<TextBox>Condensation</TextBox>, <TextBox>Density</TextBox>]}
    feedback={{ success: 'Yep', fail: 'Nope' }}
>
    <MatchTarget matches={[<TextBox>Air Temp</TextBox>]}>
        <Para>Measures the temperature of the air.</Para>
    </MatchTarget>
    <MatchTarget matches={[<TextBox>Humidity</TextBox>]}>
        <Para>Measures the amount of water vapour in the air.</Para>
    </MatchTarget>
</MatchingActivity>
```

## Layout

A lot of flexibility has been provided for layout especially to support
matching using drop zones over a background such as an image.

### Direction

You can set the flow direction (orientation) for each Set using the optional `direction` property.

Note that the `matches` property is only for when you have a match and want to display
the candidate and the match content together (rather than having the target content disappear on match).

If this property is not specified then when a candidate is "dropped" the candidate content **replaces**--\*\* rather than is put alongside/below the target content.

### Layout Direction Example

```jsx
<MatchingActivity
    direction={{
        sets: 'left',
        candidates: 'right',
        targets: 'right',
        matches: 'down',
    }}
>
    ...
</MatchingActivity>
```

### Background

You can specify a background to go behind the Targets Set using the `background` property at the top level. For an image you can use the `Image` component and import the url at the top.

### Target Positioning

You can then specify the relative positions of each `MatchTarget`
using `position` property as per the example below.

Relative positioning is in pixels and can be `left`, `right`, `top`, `bottom`. You will have to experiment once you have the background to get it right.

## Target Styling

By default there is a rounded dashed border indicating the drop target container.
But sometimes you need to change it e.g. a dark background it is hard to see it.

You can optionally style this with the `targetStyles` property at the top level.

There are several properties you can set on `targetStyles`: `border`, `borderRadius`, `opacity`, `background` and `color`.
These are passed through verbatim as CSS so look up CSS reference on MDN for what they can be.

### Set Positioning

You can overlay the candidates over the targets background image if
you want.

To do this, specify the relative position of where it should go
as with target positioning using the `positions` property.

### Background and Positioning Example

```jsx
<MatchingActivity
    feedback={{ success: 'Yep', fail: 'Nope' }}
    background={<Image src={nzMap} tooltip="NZ Map" width={400} />}
    direction={{
        candidates: 'down',
        targets: 'right',
    }}
    positions={{ candidates: { top: 0, right: 0 } }}
>
    <MatchTarget
        matches={[<TextBox maxWidth={12}>Tāmaki Makau Rau</TextBox>]}
        position={{ left: 150, top: 80 }}
    >
        <Para>Auckland</Para>
    </MatchTarget>
    ...
</MatchingActivity>
```

### Randomize Order

There is an optional additional property where you can randomise the ordering
of either or both or none of candidates and matches.

```jsx
<MatchingActivity
    ...
    randomOrder={{
        candidates: true,
        targets: true,
    }}
>
    ...
</MatchingActivity>
```
