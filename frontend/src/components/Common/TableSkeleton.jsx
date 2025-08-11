
import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Table } from 'reactstrap';

const TableSkeleton = ({ columns = 5, rows = 10 }) => {
  return (
    <SkeletonTheme baseColor="#202020" highlightColor="#444">
        <div className="table-responsive">
            <Table>
                <thead>
                <tr>
                    {Array(columns).fill(0).map((_, i) => (
                        <th key={i}><Skeleton height={30} /></th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {Array(rows).fill(0).map((_, i) => (
                    <tr key={i}>
                    {Array(columns).fill(0).map((_, j) => (
                        <td key={j}><Skeleton height={40} /></td>
                    ))}
                    </tr>
                ))}
                </tbody>
            </Table>
        </div>
    </SkeletonTheme>
  );
};

export default TableSkeleton;
