-- ============================================================
-- Author      : JRV
-- Create Date : 03/05/2026
-- Description : TRUE server-side paginated version of
--               sp_payrollemployee_tax_hdr_tbl_list.
--
--               The original SP is NOT called here.
--               The base UNION query is inlined so that
--               OFFSET/FETCH is applied directly -- SQL Server
--               returns ONLY the requested page to the app.
--
--               Returns TWO result sets:
--                 Result Set 1 : one row  -- total_records, filtered_records
--                 Result Set 2 : page rows (up to @fetch_rows)
--
-- HOW TO RUN  : Execute against HRIS_ACT database.
--               The original sp_payrollemployee_tax_hdr_tbl_list
--               is left unchanged (still used by EF / reports).
-- ============================================================

CREATE OR ALTER PROCEDURE [dbo].[sp_payrollemployee_tax_hdr_tbl_list_paged]

    @par_payroll_year       VARCHAR(04),
    @par_department_code    VARCHAR(02),
    @par_include_history    VARCHAR(01),
    @search_value           NVARCHAR(200) = '',
    @sort_column            VARCHAR(50)   = 'employee_name',
    @sort_dir               VARCHAR(04)   = 'asc',
    @offset_rows            INT           = 0,
    @fetch_rows             INT           = 10

AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @v_employment_type VARCHAR(02) = 'JO';

    -- -------------------------------------------------------
    -- RESULT SET 1 : counts  (no page rows sent to C#)
    -- -------------------------------------------------------
    SELECT
        COUNT(*)                                                        AS total_records,
        SUM(CASE
                WHEN @search_value = ''
                  OR A.empl_id                       LIKE '%' + @search_value + '%'
                  OR ISNULL(B.employee_name, '')     LIKE '%' + @search_value + '%'
                THEN 1 ELSE 0
            END)                                                        AS filtered_records
    FROM (
        -- leg 1 : JO employment-type match
        SELECT A.empl_id, B.employee_name
        FROM   payrollemployee_tax_hdr_tbl A
        INNER JOIN vw_payrollemployeemaster_info_HRIS_ACT B
               ON  B.empl_id          = A.empl_id
               AND B.department_code  = @par_department_code
               AND B.employment_type  = @v_employment_type
               AND B.effective_date   = (SELECT MAX(B1.effective_date)
                                         FROM   vw_payrollemployeemaster_info_HRIS_ACT B1
                                         WHERE  B1.empl_id        = B.empl_id
                                           AND  B1.employment_type = B.employment_type
                                           AND  B1.effective_date <= CONVERT(DATE, @par_payroll_year + '-12-31'))
        INNER JOIN jo_tax_tbl D
               ON  D.bir_class      = A.bir_class
               AND D.effective_date = (SELECT MAX(D1.effective_date)
                                       FROM   jo_tax_tbl D1
                                       WHERE  D1.bir_class      = D.bir_class
                                         AND  D1.effective_date <= CONVERT(DATE, GETDATE()))
        WHERE  ( A.effective_date = (SELECT MAX(B1.effective_date)
                                     FROM   payrollemployee_tax_hdr_tbl B1
                                     WHERE  B1.empl_id        = A.empl_id
                                       AND  B1.effective_date BETWEEN CONVERT(DATE, @par_payroll_year + '-01-01')
                                                                   AND CONVERT(DATE, @par_payroll_year + '-12-31'))
                 AND @par_include_history = 'N'
               )
           OR   @par_include_history = 'Y'

        UNION

        -- leg 2 : all employment types (employment_type filter removed)
        SELECT A.empl_id, B.employee_name
        FROM   payrollemployee_tax_hdr_tbl A
        INNER JOIN vw_payrollemployeemaster_info_HRIS_ACT B
               ON  B.empl_id         = A.empl_id
               AND B.department_code = @par_department_code
               AND B.effective_date  = (SELECT MAX(B1.effective_date)
                                        FROM   vw_payrollemployeemaster_info_HRIS_ACT B1
                                        WHERE  B1.empl_id        = B.empl_id
                                          AND  B1.employment_type = B.employment_type
                                          AND  B1.effective_date <= CONVERT(DATE, @par_payroll_year + '-12-31'))
        INNER JOIN jo_tax_tbl D
               ON  D.bir_class      = A.bir_class
               AND D.effective_date = (SELECT MAX(D1.effective_date)
                                       FROM   jo_tax_tbl D1
                                       WHERE  D1.bir_class      = D.bir_class
                                         AND  D1.effective_date <= CONVERT(DATE, GETDATE()))
        WHERE  ( A.effective_date = (SELECT MAX(B1.effective_date)
                                     FROM   payrollemployee_tax_hdr_tbl B1
                                     WHERE  B1.empl_id        = A.empl_id
                                       AND  B1.effective_date BETWEEN CONVERT(DATE, @par_payroll_year + '-01-01')
                                                                   AND CONVERT(DATE, @par_payroll_year + '-12-31'))
                 AND @par_include_history = 'N'
               )
           OR   @par_include_history = 'Y'
    ) counts_base;


    -- -------------------------------------------------------
    -- RESULT SET 2 : current page ONLY  (OFFSET / FETCH)
    -- -------------------------------------------------------
    SELECT MN.*
    FROM (
        -- leg 1
        SELECT A.empl_id
              ,B.employee_name
              ,@v_employment_type                                                  AS employment_type
              ,'JOB ORDER'                                                          AS employment_type_descr
              ,ISNULL(B.position_title1, '')                                       AS position_title1
              ,CONVERT(varchar, DATEPART(yyyy, A.effective_date))
                  + '-' + RIGHT('00' + CONVERT(varchar, DATEPART(mm, A.effective_date)), 2)
                  + '-' + RIGHT('00' + CONVERT(varchar, DATEPART(dd, A.effective_date)), 2)
                                                                                   AS effective_date
              ,A.bir_class
              ,D.bir_class_descr
              ,ISNULL(A.with_sworn,  0)                                            AS with_sworn
              ,ISNULL(A.fixed_rate,  0)                                            AS fixed_rate
              ,CAST(IIF(A.with_sworn = 1, 'YES', 'NO') AS VARCHAR(04))            AS with_sworn_descr
              ,CAST(IIF(A.fixed_rate = 1, 'YES', 'NO') AS VARCHAR(04))            AS fixed_rate_descr
              ,ISNULL(D.wi_sworn_perc, 0)                                          AS wi_sworn_perc
              ,ISNULL(D.wo_sworn_perc, 0)                                          AS wo_sworn_perc
              ,ISNULL(D.tax_perc,      0)                                          AS tax_perc
              ,ISNULL(A.total_gross_pay,  0.00)                                    AS total_gross_pay
              ,ISNULL(A.dedct_status,     0)                                       AS dedct_status
              ,ISNULL(E.rcrd_status,     'N')                                      AS rcrd_status
              ,CASE
                 WHEN ISNULL(E.rcrd_status,'') = 'A' THEN 'APPROVED'
                 WHEN ISNULL(E.rcrd_status,'') = 'R' THEN 'REJECTED'
                 ELSE 'NEW'
               END                                                                  AS rcrd_status_descr
              ,ISNULL(A.user_id_created_by, '')                                    AS user_id_created_by
              ,ISNULL(A.created_dttm,       '')                                    AS created_dttm
              ,ISNULL(A.user_id_updated_by, '')                                    AS user_id_updated_by
              ,ISNULL(A.updated_dttm,     0.00)                                    AS updated_dttm
              ,ISNULL(A.w_tax_perc,       0.00)                                    AS w_tax_perc
              ,ISNULL(A.bus_tax_perc,     0.00)                                    AS bus_tax_perc
              ,ISNULL(A.vat_perc,         0.00)                                    AS vat_perc
              ,ISNULL(A.exmpt_amt,        0.00)                                    AS exmpt_amt
        FROM   payrollemployee_tax_hdr_tbl A
        INNER JOIN vw_payrollemployeemaster_info_HRIS_ACT B
               ON  B.empl_id         = A.empl_id
               AND B.department_code = @par_department_code
               AND B.employment_type = @v_employment_type
               AND B.effective_date  = (SELECT MAX(B1.effective_date)
                                        FROM   vw_payrollemployeemaster_info_HRIS_ACT B1
                                        WHERE  B1.empl_id        = B.empl_id
                                          AND  B1.employment_type = B.employment_type
                                          AND  B1.effective_date <= CONVERT(DATE, @par_payroll_year + '-12-31'))
        INNER JOIN jo_tax_tbl D
               ON  D.bir_class      = A.bir_class
               AND D.effective_date = (SELECT MAX(D1.effective_date)
                                       FROM   jo_tax_tbl D1
                                       WHERE  D1.bir_class      = D.bir_class
                                         AND  D1.effective_date <= CONVERT(DATE, GETDATE()))
        LEFT  JOIN HRIS_PAY.dbo.payrollemployee_tax_tbl E
               ON  E.empl_id        = A.empl_id
               AND E.effective_date = (SELECT MAX(effective_date)
                                       FROM   HRIS_PAY.dbo.payrollemployee_tax_tbl X
                                       WHERE  X.empl_id = A.empl_id)
        WHERE  ( A.effective_date = (SELECT MAX(B1.effective_date)
                                     FROM   payrollemployee_tax_hdr_tbl B1
                                     WHERE  B1.empl_id        = A.empl_id
                                       AND  B1.effective_date BETWEEN CONVERT(DATE, @par_payroll_year + '-01-01')
                                                                   AND CONVERT(DATE, @par_payroll_year + '-12-31'))
                 AND @par_include_history = 'N'
               )
           OR   @par_include_history = 'Y'

        UNION

        -- leg 2
        SELECT A.empl_id
              ,B.employee_name
              ,@v_employment_type                                                  AS employment_type
              ,'JOB ORDER'                                                          AS employment_type_descr
              ,ISNULL(B.position_title1, '')                                       AS position_title1
              ,CONVERT(varchar, DATEPART(yyyy, A.effective_date))
                  + '-' + RIGHT('00' + CONVERT(varchar, DATEPART(mm, A.effective_date)), 2)
                  + '-' + RIGHT('00' + CONVERT(varchar, DATEPART(dd, A.effective_date)), 2)
                                                                                   AS effective_date
              ,A.bir_class
              ,D.bir_class_descr
              ,ISNULL(A.with_sworn,  0)                                            AS with_sworn
              ,ISNULL(A.fixed_rate,  0)                                            AS fixed_rate
              ,CAST(IIF(A.with_sworn = 1, 'YES', 'NO') AS VARCHAR(04))            AS with_sworn_descr
              ,CAST(IIF(A.fixed_rate = 1, 'YES', 'NO') AS VARCHAR(04))            AS fixed_rate_descr
              ,ISNULL(D.wi_sworn_perc, 0)                                          AS wi_sworn_perc
              ,ISNULL(D.wo_sworn_perc, 0)                                          AS wo_sworn_perc
              ,ISNULL(D.tax_perc,      0)                                          AS tax_perc
              ,ISNULL(A.total_gross_pay,  0.00)                                    AS total_gross_pay
              ,ISNULL(A.dedct_status,     0)                                       AS dedct_status
              ,ISNULL(E.rcrd_status,     'N')                                      AS rcrd_status
              ,CASE
                 WHEN ISNULL(E.rcrd_status,'') = 'A' THEN 'APPROVED'
                 WHEN ISNULL(E.rcrd_status,'') = 'R' THEN 'REJECTED'
                 ELSE 'NEW'
               END                                                                  AS rcrd_status_descr
              ,ISNULL(A.user_id_created_by, '')                                    AS user_id_created_by
              ,ISNULL(A.created_dttm,       '')                                    AS created_dttm
              ,ISNULL(A.user_id_updated_by, '')                                    AS user_id_updated_by
              ,ISNULL(A.updated_dttm,     0.00)                                    AS updated_dttm
              ,ISNULL(A.w_tax_perc,       0.00)                                    AS w_tax_perc
              ,ISNULL(A.bus_tax_perc,     0.00)                                    AS bus_tax_perc
              ,ISNULL(A.vat_perc,         0.00)                                    AS vat_perc
              ,ISNULL(A.exmpt_amt,        0.00)                                    AS exmpt_amt
        FROM   payrollemployee_tax_hdr_tbl A
        INNER JOIN vw_payrollemployeemaster_info_HRIS_ACT B
               ON  B.empl_id         = A.empl_id
               AND B.department_code = @par_department_code
               -- employment_type intentionally removed in leg 2 (same as original SP)
               AND B.effective_date  = (SELECT MAX(B1.effective_date)
                                        FROM   vw_payrollemployeemaster_info_HRIS_ACT B1
                                        WHERE  B1.empl_id        = B.empl_id
                                          AND  B1.employment_type = B.employment_type
                                          AND  B1.effective_date <= CONVERT(DATE, @par_payroll_year + '-12-31'))
        INNER JOIN jo_tax_tbl D
               ON  D.bir_class      = A.bir_class
               AND D.effective_date = (SELECT MAX(D1.effective_date)
                                       FROM   jo_tax_tbl D1
                                       WHERE  D1.bir_class      = D.bir_class
                                         AND  D1.effective_date <= CONVERT(DATE, GETDATE()))
        LEFT  JOIN HRIS_PAY.dbo.payrollemployee_tax_tbl E
               ON  E.empl_id        = A.empl_id
               AND E.effective_date = (SELECT MAX(effective_date)
                                       FROM   HRIS_PAY.dbo.payrollemployee_tax_tbl X
                                       WHERE  X.empl_id = A.empl_id)
        WHERE  ( A.effective_date = (SELECT MAX(B1.effective_date)
                                     FROM   payrollemployee_tax_hdr_tbl B1
                                     WHERE  B1.empl_id        = A.empl_id
                                       AND  B1.effective_date BETWEEN CONVERT(DATE, @par_payroll_year + '-01-01')
                                                                   AND CONVERT(DATE, @par_payroll_year + '-12-31'))
                 AND @par_include_history = 'N'
               )
           OR   @par_include_history = 'Y'
    ) MN
    WHERE  @search_value = ''
        OR MN.empl_id                   LIKE '%' + @search_value + '%'
        OR ISNULL(MN.employee_name, '') LIKE '%' + @search_value + '%'
    ORDER BY
        -- Each CASE fires only when its column is selected; all others return NULL.
        -- NULL has no effect on sort, so only the active column drives the order.
        CASE WHEN @sort_column = 'empl_id'         AND @sort_dir = 'asc'  THEN MN.empl_id         END ASC,
        CASE WHEN @sort_column = 'empl_id'         AND @sort_dir = 'desc' THEN MN.empl_id         END DESC,
        CASE WHEN @sort_column = 'employee_name'   AND @sort_dir = 'asc'  THEN MN.employee_name   END ASC,
        CASE WHEN @sort_column = 'employee_name'   AND @sort_dir = 'desc' THEN MN.employee_name   END DESC,
        CASE WHEN @sort_column = 'w_tax_perc'      AND @sort_dir = 'asc'  THEN MN.w_tax_perc      END ASC,
        CASE WHEN @sort_column = 'w_tax_perc'      AND @sort_dir = 'desc' THEN MN.w_tax_perc      END DESC,
        CASE WHEN @sort_column = 'bus_tax_perc'    AND @sort_dir = 'asc'  THEN MN.bus_tax_perc    END ASC,
        CASE WHEN @sort_column = 'bus_tax_perc'    AND @sort_dir = 'desc' THEN MN.bus_tax_perc    END DESC,
        CASE WHEN @sort_column = 'vat_perc'        AND @sort_dir = 'asc'  THEN MN.vat_perc        END ASC,
        CASE WHEN @sort_column = 'vat_perc'        AND @sort_dir = 'desc' THEN MN.vat_perc        END DESC,
        CASE WHEN @sort_column = 'total_gross_pay' AND @sort_dir = 'asc'  THEN MN.total_gross_pay END ASC,
        CASE WHEN @sort_column = 'total_gross_pay' AND @sort_dir = 'desc' THEN MN.total_gross_pay END DESC,
        MN.employee_name ASC   -- default tiebreaker
    OFFSET @offset_rows ROWS FETCH NEXT @fetch_rows ROWS ONLY;

END
GO
