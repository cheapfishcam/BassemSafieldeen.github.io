# This file is generated automatically by QuTiP.
# (C) 2011 and later, QuSTaR
import numpy as np
cimport numpy as np
cimport cython
np.import_array()
cdef extern from "numpy/arrayobject.h" nogil:
    void PyDataMem_NEW_ZEROED(size_t size, size_t elsize)
    void PyArray_ENABLEFLAGS(np.ndarray arr, int flags)
    void PyDataMem_FREE(void * ptr)
from qutip.cy.interpolate cimport interp, zinterp
from qutip.cy.math cimport erf
cdef double pi = 3.14159265358979323
from qutip.cy.brtools cimport (dense_add_mult, ZHEEVR, dense_to_eigbasis,
        vec_to_eigbasis, vec_to_fockbasis, skew_and_dwmin,
        diag_liou_mult, spec_func, farray_alloc)
from qutip.cy.brtools cimport (cop_super_mult, br_term_mult)
include 'C:/Users/basse/Anaconda3/envs/qutip_for_genetic_algorithm/lib/site-packages/qutip/cy/complex_math.pxi'


@cython.cdivision(True)
@cython.boundscheck(False)
@cython.wraparound(False)
def cy_td_ode_rhs(
        double t,
        complex[::1] vec,
        complex[::1,:] H0,
        unsigned int nrows):
    
    cdef double complex * out = <complex *>PyDataMem_NEW_ZEROED(nrows**2,sizeof(complex))
     
    cdef complex[::1, :] H = farray_alloc(nrows)
    cdef complex[::1, :] evecs = farray_alloc(nrows)
    cdef double * eigvals = <double *>PyDataMem_NEW_ZEROED(nrows,sizeof(double))
    dense_add_mult(H, H0, 1)
    ZHEEVR(H, eigvals, evecs, nrows)
    PyDataMem_FREE(&H[0,0])
    cdef double complex * eig_vec = vec_to_eigbasis(vec, evecs, nrows)
    diag_liou_mult(eigvals, eig_vec, out, nrows)
    

    cdef np.ndarray[complex, ndim=1, mode='c'] arr_out = vec_to_fockbasis(out, evecs, nrows)
    PyDataMem_FREE(&evecs[0,0])
    PyDataMem_FREE(eigvals)
    PyDataMem_FREE(eig_vec)
    PyDataMem_FREE(out)
    return arr_out
