import './dropZone.scss';

import React from 'react';

import dropIcon from '../../static/drop.svg';

interface OwnProps {
    className?: string;
    overClass?: string;
    prompt: React.ReactChild;
    acceptExtensions: string;
    onFilePicked?: (e: File) => void;
}

export default class DropZone extends React.PureComponent<
    OwnProps,
    { over: boolean }
> {
    constructor(props: OwnProps) {
        super(props);
        this.state = { over: false };
    }

    onDrop(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        this.setState({ over: false });
        this.tryRaiseEvent(e.dataTransfer.files);
    }

    onDragOver(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
    }

    onDragEnd(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
    }

    onDragLeave(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        this.setState({ over: false });
    }

    onDragEnter(e: React.DragEvent<HTMLDivElement>) {
        e.preventDefault();
        if (e.dataTransfer.types.indexOf('Files') > -1) {
            this.setState({ over: true });
        }
    }

    onFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        this.tryRaiseEvent(event.target.files);
    }

    getClassName() {
        let classes: string[] = ['dropzone'];
        if (this.props.className) {
            classes.push(this.props.className);
        }
        if (this.state.over) {
            classes.push('dragOver');
            if (this.props.overClass) {
                classes.push(this.props.overClass);
            }
        }
        return classes.join(' ');
    }

    private tryRaiseEvent(files: FileList | null) {
        if (files !== null && files.length > 0 && this.props.onFilePicked) {
            this.props.onFilePicked(files[0]);
        }
    }

    render() {
        return (
            <div
                className={this.getClassName()}
                onDrop={this.onDrop.bind(this)}
                onDragOver={this.onDragOver.bind(this)}
                onDragLeave={this.onDragLeave.bind(this)}
                onDragEnter={this.onDragEnter.bind(this)}
                onDragEnd={this.onDragEnd.bind(this)}
            >
                {this.props.children}
                <div className="dropzone-text">
                    <img style={{ width: '80px' }} src={dropIcon} alt="Drop" />
                    {this.props.prompt}
                </div>
                <label
                    className="button button-primary"
                    style={{ margin: '20px', cursor: 'pointer' }}
                >
                    or select it from your computer
                    <input
                        type="file"
                        accept={this.props.acceptExtensions}
                        className="inputfile"
                        value=""
                        onChange={this.onFileInputChange.bind(this)}
                    />
                </label>
            </div>
        );
    }
}
