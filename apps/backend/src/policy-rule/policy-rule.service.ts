import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService, Prisma } from '@repo/prisma';
import { PolicyRuleResponseDto } from './dto/policy-rule-response.dto';

@Injectable()
export class PolicyRuleService {
  public constructor(private readonly prisma: PrismaService) {}

  /**
   * Fetch all rules for a given policy.
   * Optionally filters only active ones (valid_to is null or in the future).
   */
  public async findByPolicyId(
    policyId: number,
    onlyActive = false,
  ): Promise<PolicyRuleResponseDto[]> {
    const now = new Date();

    const whereClause: Prisma.PolicyRuleWhereInput = {
      policy_id: BigInt(policyId),
    };

    if (onlyActive) {
      whereClause.OR = [{ valid_to: null }, { valid_to: { gt: now } }];
    }

    const rules = await this.prisma.policyRule.findMany({
      where: whereClause,
      include: {
        metric: true,
        comparator: true,
        interval: true,
        scope: true,
      },
      orderBy: { created_at: 'desc' },
    });

    return rules.map((r) => ({
      id: r.id.toString(),
      policy_id: r.policy_id.toString(),
      metric: r.metric,
      comparator: r.comparator,
      interval: r.interval,
      scope: r.scope,
      value: r.value.toString(),
      token_address: r.token_address,
      valid_from: r.valid_from.toISOString(),
      valid_to: r.valid_to?.toISOString() ?? null,
      created_at: r.created_at.toISOString(),
      updated_at: r.updated_at.toISOString(),
    }));
  }

  /**
   * Soft delete: sets valid_to = now()
   */
  public async deleteByPolicyId(policyId: number): Promise<void> {
    const existingRules = await this.prisma.policyRule.findMany({
      where: { policy_id: BigInt(policyId) },
    });

    if (existingRules.length === 0) {
      throw new NotFoundException(`No rules found for policy ID ${policyId}`);
    }

    await this.prisma.policyRule.updateMany({
      where: {
        policy_id: BigInt(policyId),
        OR: [{ valid_to: null }, { valid_to: { gt: new Date() } }],
      },
      data: { valid_to: new Date() },
    });
  }
}
