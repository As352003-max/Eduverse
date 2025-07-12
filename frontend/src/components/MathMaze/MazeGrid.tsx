import React from 'react';
import MazeCell from './MazeCell';
import { Position } from '../../types/mathMazeTypes';

interface MazeGridProps {
    mazeLayout: number[][];
    currentPosition: Position;
    targetPosition: Position;
    pathTaken: Position[];
}

const MazeGrid: React.FC<MazeGridProps> = ({ mazeLayout, currentPosition, targetPosition, pathTaken }) => {
    return (
        <div className="grid border border-gray-400">
            {mazeLayout.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                    {row.map((cellType, colIndex) => (
                        <MazeCell
                            key={`${rowIndex}-${colIndex}`}
                            type={cellType}
                            isCurrentPosition={currentPosition.row === rowIndex && currentPosition.col === colIndex}
                            isTargetPosition={targetPosition.row === rowIndex && targetPosition.col === colIndex}
                            isInPath={pathTaken.some(p => p.row === rowIndex && p.col === colIndex)}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
};

export default MazeGrid;