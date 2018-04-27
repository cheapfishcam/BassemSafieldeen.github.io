# This file is generated automatically by QuTiP.
# (C) 2011 and later, QuSTaR

import numpy as np
cimport numpy as np
cimport cython
np.import_array()
cdef extern from "numpy/arrayobject.h" nogil:
    void PyDataMem_NEW_ZEROED(size_t size, size_t elsize)
    void PyArray_ENABLEFLAGS(np.ndarray arr, int flags)

from qutip.cy.spmatfuncs cimport spmvpy
from qutip.cy.interpolate cimport interp, zinterp
from qutip.cy.math cimport erf
cdef double pi = 3.14159265358979323

include 'C:/Users/basse/Anaconda3/envs/qutip_for_genetic_algorithm/lib/site-packages/qutip/cy/complex_math.pxi'



@cython.cdivision(True)
@cython.boundscheck(False)
@cython.wraparound(False)
def cy_td_ode_rhs(
        double t,
        complex[::1] vec,
        complex[::1] data0,int[::1] idx0,int[::1] ptr0,
        complex[::1] data1,int[::1] idx1,int[::1] ptr1,
        float k):
    
    cdef size_t row
    cdef unsigned int num_rows = vec.shape[0]
    cdef double complex * out = <complex *>PyDataMem_NEW_ZEROED(num_rows,sizeof(complex))
     
    spmvpy(&data0[0], &idx0[0], &ptr0[0], &vec[0], 1.0, &out[0], num_rows)
     
    spmvpy(&data1[0], &idx1[0], &ptr1[0], &vec[0],  abs(sqrt(k))**2, out, num_rows)
    cdef np.npy_intp dims = num_rows
    cdef np.ndarray[complex, ndim=1, mode='c'] arr_out = np.PyArray_SimpleNewFromData(1, &dims, np.NPY_COMPLEX128, out)
    PyArray_ENABLEFLAGS(arr_out, np.NPY_OWNDATA)
    return arr_out   


@cython.cdivision(True)
@cython.boundscheck(False)
@cython.wraparound(False)
def col_spmv(int which, double t, complex[::1] data, int[::1] idx, int[::1] ptr, complex[::1] vec,
        float k):
    cdef size_t row
    cdef unsigned int jj, row_start, row_end
    cdef unsigned int num_rows = vec.shape[0]
    cdef complex dot
    cdef complex * out = <complex *>PyDataMem_NEW_ZEROED(num_rows,sizeof(complex))

    for row in range(num_rows):
        dot = 0.0
        row_start = ptr[row]
        row_end = ptr[row+1]
        for jj in range(row_start,row_end):
            dot = dot + data[jj] * vec[idx[jj]]
        out[row] = dot
    
    cdef size_t kk
    cdef complex ctd = sqrt(k)
    if which == 0:
        for kk in range(num_rows):
            out[kk] *= ctd
                     
    cdef np.npy_intp dims = num_rows
    cdef np.ndarray[complex, ndim=1, mode='c'] arr_out = np.PyArray_SimpleNewFromData(1, &dims, np.NPY_COMPLEX128, out)
    PyArray_ENABLEFLAGS(arr_out, np.NPY_OWNDATA)
    return arr_out   


@cython.cdivision(True)
@cython.boundscheck(False)
@cython.wraparound(False)
def col_expect(int which, double t, complex[::1] data, int[::1] idx, int[::1] ptr, complex[::1] vec,
        float k):
    cdef size_t row
    cdef int num_rows = vec.shape[0]
    cdef complex out = 0.0
    cdef np.ndarray[complex, ndim=1, mode='c'] dot = col_spmv(which, t, data, idx, ptr,
                                                    vec,k)

    for row in range(num_rows):
        out += conj(vec[row]) * dot[row]
    
    if which == 0:
        out *= conj(sqrt(k))
    return real(out)
