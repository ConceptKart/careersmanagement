import { Prisma } from "@prisma/client";
import { employeesRepository } from "@/repositories/employees.repository";
import {
  salaryRecordsRepository,
  type AdminSalaryListResult,
} from "@/repositories/salary-records.repository";
import type {
  AdminSalaryFormValues,
  AdminSalaryListFilters,
} from "@/validators/admin-salary.schema";

export class SalaryError extends Error {
  constructor(
    message: string,
    public readonly fieldErrors?: Record<string, string>,
  ) {
    super(message);
    this.name = "SalaryError";
  }
}

function parseDateOnly(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toDecimal(value: string): Prisma.Decimal {
  return new Prisma.Decimal(value);
}

export class SalaryRecordsService {
  async getRecords(
    filters: AdminSalaryListFilters,
  ): Promise<AdminSalaryListResult> {
    return salaryRecordsRepository.findAdminList(filters);
  }

  async getRecord(id: string) {
    return salaryRecordsRepository.findById(id);
  }

  async listEmployeeOptions() {
    return employeesRepository.listEmployeeOptions();
  }

  async createRecord(values: AdminSalaryFormValues) {
    const employee = await employeesRepository.findById(values.employeeId);
    if (!employee) {
      throw new SalaryError("Employee not found", {
        employeeId: "Employee not found",
      });
    }
    const duplicate = await salaryRecordsRepository.findByEmployeeMonth(
      values.employeeId,
      values.month,
    );
    if (duplicate) {
      throw new SalaryError(
        "A salary record already exists for this employee and month",
        { month: "A record already exists for this month" },
      );
    }

    return salaryRecordsRepository.create({
      employeeId: values.employeeId,
      month: values.month,
      basicSalary: toDecimal(values.basicSalary),
      hra: toDecimal(values.hra ?? "0"),
      allowances: toDecimal(values.allowances ?? "0"),
      deductions: toDecimal(values.deductions ?? "0"),
      netSalary: toDecimal(values.netSalary),
      paidOn: values.paidOn ? parseDateOnly(values.paidOn) : null,
    });
  }

  async updateRecord(id: string, values: AdminSalaryFormValues) {
    const existing = await salaryRecordsRepository.findById(id);
    if (!existing) return null;

    const employee = await employeesRepository.findById(values.employeeId);
    if (!employee) {
      throw new SalaryError("Employee not found", {
        employeeId: "Employee not found",
      });
    }

    if (
      existing.employeeId !== values.employeeId ||
      existing.month !== values.month
    ) {
      const duplicate = await salaryRecordsRepository.findByEmployeeMonth(
        values.employeeId,
        values.month,
      );
      if (duplicate && duplicate.id !== id) {
        throw new SalaryError(
          "A salary record already exists for this employee and month",
          { month: "A record already exists for this month" },
        );
      }
    }

    return salaryRecordsRepository.update(id, {
      employeeId: values.employeeId,
      month: values.month,
      basicSalary: toDecimal(values.basicSalary),
      hra: toDecimal(values.hra ?? "0"),
      allowances: toDecimal(values.allowances ?? "0"),
      deductions: toDecimal(values.deductions ?? "0"),
      netSalary: toDecimal(values.netSalary),
      paidOn: values.paidOn ? parseDateOnly(values.paidOn) : null,
    });
  }
}

export const salaryRecordsService = new SalaryRecordsService();
