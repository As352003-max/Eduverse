import React from 'react';
import { motion } from 'framer-motion';

interface MazeCellProps {
    type: number;
    isCurrentPosition: boolean;
    isTargetPosition: boolean;
    isInPath: boolean;
}

const MazeCell: React.FC<MazeCellProps> = ({ type, isCurrentPosition, isTargetPosition, isInPath }) => {
    let cellClasses = 'w-8 h-8 flex items-center justify-center';

    if (type === 1) {
        cellClasses += ' bg-gray-700 border border-gray-600';
    } else {
        cellClasses += ' bg-gray-200 border border-gray-300';
    }

    if (isInPath) {
        cellClasses += ' bg-blue-300';
    }

    return (
        <motion.div
            className={cellClasses}
            initial={{ opacity: 0.5, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.1 }}
        >
            {isCurrentPosition && (
                <motion.div
                    className="w-5 h-5 bg-green-500 rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10 }}
                ></motion.div>
            )}
            {isTargetPosition && (
                <div className="w-5 h-5 bg-red-500 rounded-md flex items-center justify-center text-white text-xs font-bold">
                    END
                </div>
            )}
        </motion.div>
    );
};

export default MazeCell;