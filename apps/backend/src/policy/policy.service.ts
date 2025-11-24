import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { POLICY_STATUS } from '@repo/constants';
import { PrismaService, Prisma } from '@repo/prisma';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { PolicyResponseDto } from './dto/policy-response.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

type TPolicyWithRelations = Prisma.PolicyGetPayload<{
  include: {
    chain: true;
    status: true;
  };
}>;

@Injectable()
export class PolicyService {
  private readonly paymasterAddress: string;

  public constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    const rawPaymasterAddress = this.configService.get<string>('PAYMASTER_ADDRESS') || '';

    if (!rawPaymasterAddress) {
      throw new Error('PAYMASTER_ADDRESS environment variable is not set');
    }

    this.paymasterAddress = rawPaymasterAddress.toLowerCase();
  }

  public async create(createPolicyDto: CreatePolicyDto): Promise<PolicyResponseDto> {
    return this.prisma.$transaction(async (tx) => {
      const policy = await tx.policy.create({
        data: {
          paymaster_address: this.paymasterAddress,
          chain_id: BigInt(createPolicyDto.chain_id),
          name: createPolicyDto.name,
          status_id: createPolicyDto.status_id,
          max_budget_wei: BigInt(createPolicyDto.max_budget_wei),
          is_public: createPolicyDto.is_public,
          whitelisted_addresses: createPolicyDto.whitelisted_addresses,
          valid_from: createPolicyDto.valid_from ? new Date(createPolicyDto.valid_from) : undefined,
          valid_to: createPolicyDto.valid_to ? new Date(createPolicyDto.valid_to) : undefined,
        },
        include: {
          chain: true,
          status: true,
        },
      });

      if (createPolicyDto.rules && createPolicyDto.rules.length > 0) {
        console.log(`🟠 Creating ${createPolicyDto.rules.length} rules...`);

        for (const rule of createPolicyDto.rules) {
          const baseData: Prisma.PolicyRuleCreateInput = {
            policy: { connect: { id: BigInt(policy.id) } },
            value: rule.amount,
            token_address: rule.token_address ?? null,
            valid_from: createPolicyDto.valid_from
              ? new Date(createPolicyDto.valid_from)
              : undefined,
            valid_to: null,
            metric: { connect: { id: rule.metric } },
            comparator: { connect: { id: rule.comparator } },
            interval: { connect: { id: rule.interval } },
          };

          if (rule.scope) {
            baseData.scope = { connect: { id: rule.scope } };
          }

          await tx.policyRule.create({ data: baseData });
        }
      }

      return this.transformPolicyResponse(policy);
    });
  }

  public async findAll(status?: string): Promise<PolicyResponseDto[]> {
    const whereClause = status ? { status_id: status.toUpperCase() } : {};

    const policies = await this.prisma.policy.findMany({
      where: whereClause,
      include: {
        chain: true,
        status: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return policies.map((policy) => this.transformPolicyResponse(policy));
  }

  public async findOne(id: number): Promise<PolicyResponseDto> {
    const policy = await this.prisma.policy.findUnique({
      where: { id: BigInt(id) },
      include: { chain: true, status: true },
    });

    if (!policy) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }

    return this.transformPolicyResponse(policy);
  }

  public async update(id: number, updatePolicyDto: UpdatePolicyDto): Promise<PolicyResponseDto> {
    const existingPolicy = await this.prisma.policy.findUnique({
      where: { id: BigInt(id) },
    });

    if (!existingPolicy) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updateData: Prisma.PolicyUpdateInput = {
        ...(updatePolicyDto.name !== undefined && { name: updatePolicyDto.name }),
        ...(updatePolicyDto.max_budget_wei !== undefined && {
          max_budget_wei: BigInt(updatePolicyDto.max_budget_wei),
        }),
        ...(updatePolicyDto.is_public !== undefined && {
          is_public: updatePolicyDto.is_public,
        }),
        ...(updatePolicyDto.whitelisted_addresses !== undefined && {
          whitelisted_addresses: updatePolicyDto.whitelisted_addresses,
        }),
        ...(updatePolicyDto.valid_from !== undefined && {
          valid_from: new Date(updatePolicyDto.valid_from),
        }),
        ...(updatePolicyDto.valid_to !== undefined && {
          valid_to: new Date(updatePolicyDto.valid_to),
        }),
        ...(updatePolicyDto.chain_id !== undefined && {
          chain: { connect: { id: BigInt(updatePolicyDto.chain_id) } },
        }),
        ...(updatePolicyDto.status_id !== undefined && {
          status: { connect: { id: updatePolicyDto.status_id } },
        }),
      };

      const updatedPolicy = await tx.policy.update({
        where: { id: BigInt(id) },
        data: updateData,
        include: { chain: true, status: true },
      });

      if (updatePolicyDto.rules) {
        const existingRules = await tx.policyRule.findMany({
          where: {
            policy_id: BigInt(id),
            OR: [{ valid_to: null }, { valid_to: { gt: new Date() } }],
          },
        });

        const incomingRuleIds = updatePolicyDto.rules
          .filter((r) => r.id !== undefined)
          .map((r) => BigInt(r.id!));

        const toDeactivate = existingRules.filter((r) => !incomingRuleIds.includes(r.id));

        if (toDeactivate.length > 0) {
          await tx.policyRule.updateMany({
            where: { id: { in: toDeactivate.map((r) => r.id) } },
            data: { valid_to: new Date() },
          });
        }

        const newRules = updatePolicyDto.rules.filter((r) => !r.id);

        for (const rule of newRules) {
          const ruleData: Prisma.PolicyRuleCreateInput = {
            policy: { connect: { id: BigInt(id) } },
            metric: { connect: { id: rule.metric } },
            comparator: { connect: { id: rule.comparator } },
            interval: { connect: { id: rule.interval } },
            value: rule.amount,
            token_address: rule.token_address ?? null,
            valid_from: updatePolicyDto.valid_from
              ? new Date(updatePolicyDto.valid_from)
              : new Date(),
            valid_to: null,
          };

          if (typeof rule.scope === 'string' && rule.scope.trim().length > 0) {
            ruleData.scope = { connect: { id: rule.scope } };
          }

          await tx.policyRule.create({
            data: ruleData,
          });
        }
      }

      return this.transformPolicyResponse(updatedPolicy);
    });
  }

  public async remove(id: number): Promise<{ message: string }> {
    const policy = await this.prisma.policy.findUnique({
      where: { id: BigInt(id) },
    });

    if (!policy) {
      throw new NotFoundException(`Policy with ID ${id} not found`);
    }

    await this.prisma.policy.update({
      where: { id: BigInt(id) },
      data: {
        status_id: POLICY_STATUS.INACTIVE.id,
        valid_to: new Date(),
      },
    });

    return { message: `Policy ${id} has been successfully deleted` };
  }

  private transformPolicyResponse(policy: TPolicyWithRelations): PolicyResponseDto {
    return {
      id: policy.id.toString(),
      name: policy.name,
      paymaster_address: policy.paymaster_address,
      chain_id: policy.chain_id.toString(),
      status_id: policy.status_id,
      max_budget_wei: policy.max_budget_wei.toString(),
      is_public: policy.is_public,
      whitelisted_addresses: policy.whitelisted_addresses,
      valid_from: policy.valid_from.toISOString(),
      valid_to: policy.valid_to?.toISOString(),
      created_at: policy.created_at.toISOString(),
      updated_at: policy.updated_at.toISOString(),
      chain: policy.chain
        ? {
            id: policy.chain.id.toString(),
            name: policy.chain.name,
          }
        : undefined,
      status: policy.status
        ? {
            id: policy.status.id,
            name: policy.status.name,
            description: policy.status.description ?? undefined,
          }
        : undefined,
    };
  }
}
